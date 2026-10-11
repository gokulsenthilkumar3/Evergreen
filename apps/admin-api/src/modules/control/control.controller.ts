import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ControlService } from './control.service';
@Controller('control')
export class ControlController {
 constructor(private readonly service:ControlService) {}
 @Get('records') list(@Query('kind') kind?:string) { return this.service.list(kind); }
 @Post('records') create(@Body() body:any,@Req() req:any) { return this.service.save(body,req.providerActor); }
 @Patch('records/:id') update(@Param('id') id:string,@Body() body:any,@Req() req:any) { return this.service.save(body,req.providerActor,id); }
 @Get('audit') audit() { return this.service.audit(); }
 @Get('database') database() { return this.service.database(); }
}
