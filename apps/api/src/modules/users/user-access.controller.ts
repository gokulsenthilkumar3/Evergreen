import { appendUserAudit } from '../../utils/user-audit';
import { BadRequestException, Body, Controller, Get, Injectable, NotFoundException, Param, ParseIntPipe, Put, Req, RequestMethod, UseGuards } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../../services/prisma.service';
import { Roles } from '../../decorators/roles.decorator';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ROLE_HIERARCHY } from '../../utils/roles';
import { staffRouteAllowed } from '../../utils/staff-access';
import { IS_PUBLIC_KEY } from '../../decorators/public.decorator';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
class StaffRuleDto {
  @IsIn(['GET','POST','PUT','PATCH','DELETE','HEAD','OPTIONS','*']) method!: string;
  @IsString() @MaxLength(300) path!: string;
  @IsIn(['ALLOW','DENY']) effect!: string;
  @IsOptional() @IsDateString() expiresAt?: string;
}
class StaffPolicyDto {
  @IsBoolean() scopedAccess!: boolean;
  @IsArray() @ArrayMaxSize(100) @ValidateNested({each:true}) @Type(()=>StaffRuleDto) rules!: StaffRuleDto[];
  @IsString() @MinLength(5) @MaxLength(500) reason!: string;
  @IsDateString() expectedUpdatedAt!: string;
}
interface Endpoint { method:string;path:string;requiredRoles:string[] }
@Injectable()
export class UserAccessService {
  constructor(private readonly prisma:PrismaService,private readonly discovery:DiscoveryService) {}
  catalogue():Endpoint[] {
    const endpoints=new Map<string,Endpoint>();
    for(const wrapper of this.discovery.getControllers()) {
      if(!wrapper.metatype?.prototype) continue;
      const bases=[Reflect.getMetadata(PATH_METADATA,wrapper.metatype)||''].flat();
      for(const name of Object.getOwnPropertyNames(wrapper.metatype.prototype)) {
        if(name==='constructor') continue;
        const method=wrapper.metatype.prototype[name];
        if(typeof method!=='function') continue;
        if(Reflect.getMetadata(IS_PUBLIC_KEY,method)||Reflect.getMetadata(IS_PUBLIC_KEY,wrapper.metatype))continue;
        const verb=Reflect.getMetadata(METHOD_METADATA,method);
        if(typeof verb!=='number') continue;
        for(const base of bases) for(const route of [Reflect.getMetadata(PATH_METADATA,method)||''].flat()) {
          const path=('/'+base+'/'+route).replace(/\/+/g,'/').replace(/\/$/,'')||'/';
          if(path==='/'||/^\/(auth|sessions)(\/|$)/.test(path)) continue;
          const http=RequestMethod[verb]==='ALL'?'*':RequestMethod[verb];
          const requiredRoles=Reflect.getMetadata(ROLES_KEY,method)||Reflect.getMetadata(ROLES_KEY,wrapper.metatype)||(http==='GET'||http==='HEAD'?['VIEWER']:http==='DELETE'?['ADMIN']:['MODIFIER']);
          if(!endpoints.has(http+' '+path)) endpoints.set(http+' '+path,{method:http,path,requiredRoles});
        }
      }
    }
    return [...endpoints.values()].sort((a,b)=>(a.path+a.method).localeCompare(b.path+b.method));
  }
  async inspect(id:number,licensedRoles:string[]) {
    const user=await this.prisma.user.findUnique({where:{id},select:{id:true,role:true,status:true,scopedAccess:true,updatedAt:true,accessRules:{where:{revokedAt:null},orderBy:{createdAt:'asc'}}}});
    if(!user)throw new NotFoundException('User not found');
    const catalogue=this.catalogue(), hierarchy=ROLE_HIERARCHY[user.role]||[];
    return {...user,catalogue:catalogue.map(endpoint=>({...endpoint,allowed:user.status==='ACTIVE'&&licensedRoles.includes(user.role)&&endpoint.requiredRoles.some(role=>hierarchy.includes(role))&&staffRouteAllowed(user.scopedAccess,user.accessRules,endpoint.method,endpoint.path)}))};
  }
  async replace(id:number,input:StaffPolicyDto,actor:{userId:number;username:string}) {
    if(input.reason.trim().length<5||id===actor.userId)throw new BadRequestException('Another administrator must change your access policy with a reason');
    const catalogue=this.catalogue(), paths=new Set(catalogue.map(endpoint=>endpoint.method+' '+endpoint.path));
    const modules=new Set(catalogue.map(endpoint=>'/'+endpoint.path.split('/')[1]+'/*'));
    for(const rule of input.rules) {
      if(!(paths.has(rule.method+' '+rule.path)||(rule.method==='*'&&catalogue.some(endpoint=>endpoint.path===rule.path))||modules.has(rule.path)))throw new BadRequestException('Access rule must reference an existing endpoint or module');
      if(rule.expiresAt&&new Date(rule.expiresAt).getTime()<=Date.now())throw new BadRequestException('Rule expiry must be in the future');
    }
    return this.prisma.$transaction(async tx=>{
      const user=await tx.user.findUnique({where:{id}});
      if(!user||user.status==='DELETED')throw new NotFoundException('User not found');
      if(user.role==='ADMIN')throw new BadRequestException('Administrator accounts retain full administration; assign a staff role before scoping access');
      if(user.updatedAt.getTime()!==new Date(input.expectedUpdatedAt).getTime())throw new BadRequestException('Account changed; reload the access policy before saving');
      await tx.userAccessRule.updateMany({where:{userId:id,revokedAt:null},data:{revokedAt:new Date()}});
      for(const rule of input.rules)await tx.userAccessRule.create({data:{userId:id,method:rule.method,path:rule.path,effect:rule.effect,expiresAt:rule.expiresAt?new Date(rule.expiresAt):null,reason:input.reason.trim(),createdBy:actor.username}});
      await tx.user.update({where:{id},data:{scopedAccess:input.scopedAccess,updatedBy:actor.username}});
      await appendUserAudit(tx, {data:{username:actor.username,action:'STAFF_ACCESS_POLICY',module:'USER_MANAGEMENT',details:`Updated user ${id}: ${input.scopedAccess?'allow-list':'role-default'} access; ${input.rules.length} rules; reason: ${input.reason.trim()}`}});
      return {recorded:true};
    });
  }
}
@Controller('users')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('ADMIN')
export class UserAccessController {
  constructor(private readonly access:UserAccessService){}
  @Get(':id/access') inspect(@Param('id',ParseIntPipe) id:number,@Req() req:AuthenticatedRequest&{installationLicence?:{roles:string[]}}){return this.access.inspect(id,req.installationLicence?.roles||[]);}
  @Put(':id/access') replace(@Param('id',ParseIntPipe) id:number,@Body() body:StaffPolicyDto,@Req() req:AuthenticatedRequest){return this.access.replace(id,body,req.user);}
}
