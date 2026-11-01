import { appendUserAudit } from '../../utils/user-audit';
import { BadRequestException, Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { TOTP } from 'otplib';
import { PrismaService } from '../../services/prisma.service';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { verifyPassword } from '../auth/passwords';
import { DEFAULT_SESSION_POLICY } from '../../utils/session-policy';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
class SessionPolicyDto {
  @IsInt() @Min(5) @Max(10080) absoluteMinutes!:number;
  @IsInt() @Min(0) @Max(1440) idleMinutes!:number;
  @IsInt() @Min(1) @Max(50) maxConcurrent!:number;
  @IsIn(['REJECT','REVOKE_OLDEST']) limitAction!:string;
  @IsString() @MinLength(5) @MaxLength(500) reason!:string;
  @IsString() currentPassword!:string;
  @IsOptional() @IsString() @Matches(/^\d{6}$/) code?:string;
}
@Controller('users/session-policies')
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles('ADMIN')
export class SessionPolicyController {
  constructor(private readonly prisma:PrismaService){}
  @Get() async list(){const saved=await this.prisma.userSessionPolicy.findMany();return ['ADMIN','MODIFIER','VIEWER'].map(role=>saved.find(policy=>policy.role===role)||{role,...DEFAULT_SESSION_POLICY});}
  @Put(':role') async save(@Param('role') role:string,@Body() body:SessionPolicyDto,@Req() req:AuthenticatedRequest){
    if(!['ADMIN','MODIFIER','VIEWER'].includes(role)||body.reason.trim().length<5||body.idleMinutes>body.absoluteMinutes)throw new BadRequestException('Invalid session policy or reason');
    const actor=await this.prisma.user.findUnique({where:{id:req.user.userId}});
    if(!actor||!await verifyPassword(actor.password,body.currentPassword))throw new BadRequestException('Current password is incorrect');
    if(actor.isTotpEnabled&&(!body.code||!actor.totpSecret||!(await new TOTP().verify(body.code,{secret:actor.totpSecret})).valid))throw new BadRequestException('Authenticator code is required');
    return this.prisma.$transaction(async tx=>{
      const values={absoluteMinutes:body.absoluteMinutes,idleMinutes:body.idleMinutes,maxConcurrent:body.maxConcurrent,limitAction:body.limitAction,updatedBy:req.user.username};
      const policy=await tx.userSessionPolicy.upsert({where:{role},create:{role,...values},update:values});
      await appendUserAudit(tx, {data:{username:req.user.username,action:'SESSION_POLICY',module:'USER_MANAGEMENT',details:`Updated ${role} session policy: absolute=${body.absoluteMinutes}m idle=${body.idleMinutes}m concurrent=${body.maxConcurrent}; reason: ${body.reason.trim()}`}});
      return policy;
    });
  }
}
