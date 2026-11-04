import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ControlService } from './control.service';
import { EvidenceService } from './evidence.service';
@Controller('control')
export class ControlController {
 constructor(private readonly service:ControlService,private readonly evidence:EvidenceService) {}
 @Get('records') list(@Query('kind') kind?:string) { return this.service.list(kind); }
 @Get('records/:id') async record(@Param('id') id:string){return this.service.record(id);}
 @Post('records') create(@Body() body:any,@Req() req:any) { return this.service.save(body,req.providerActor); }
 @Patch('records/:id') update(@Param('id') id:string,@Body() body:any,@Req() req:any) { return this.service.save(body,req.providerActor,id); }
 @Get('audit') audit() { return this.service.audit(); }
 @Get('proof') proof(@Query() query:any) { return this.evidence.ledger(query); }
 @Post('proof/verify') @HttpCode(200) verify(@Req() req:any) { this.evidence.limit(req.providerActor,'chain',3);return this.evidence.verifyChain(); }
 @Get('evidence/:id') observation(@Param('id') id:string) { return this.evidence.evidence(id); }
 @Post('explorer') @HttpCode(200) explore(@Body() body:{ table?: string; page?: number; tier?: string; preview?: boolean },@Req() req:any) { this.evidence.limit(req.providerActor,'explorer');return this.service.explore(body,req.providerActor); }
 @Get('search') search(@Query('q') q:string,@Req() req:any) {this.evidence.limit(req.providerActor,'search',120);return this.evidence.search(q);}
 @Get('health') health(){return this.evidence.health();}
 @Get('requests') requests(){return this.evidence.requests();}
 @Post(':id/attest') @HttpCode(200) attest(@Param('id') id:string,@Body() body:any,@Req() req:any){return this.evidence.attest(id,body,req.providerActor);}
 @Get('database') database() { return this.service.database(); }
 @Get('system') system() { return this.service.system(); }
 @Get('customer-apis/:id') customerApis(@Param('id') id:string) { return this.service.customerApis(id); }
}
