import { Controller, Get, Put, Body, Req } from '@nestjs/common';
import { UpdateSettingsDto } from './settings.dto';
import type { AuthenticatedRequest } from '../../types/authenticated-request';
import { SettingsService } from './settings.service';
import { Roles } from '../../decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles('ADMIN')
  async updateSettings(@Body() data: UpdateSettingsDto, @Req() req: AuthenticatedRequest) {
    return this.settingsService.updateSettings(data, req.user.username);
  }
}
