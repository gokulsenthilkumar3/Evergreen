import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto, RevokeUserSessionsDto, UserStatusDto } from './users.dto';
import type { AuthenticatedRequest } from '../../types/authenticated-request';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.createUser(createUserDto, req.user.username);
  }

  @Get()
  async getUsers() {
    return this.usersService.findAllUsers();
  }

  @Put(':id')
  @Roles('ADMIN')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.updateUser(id, updateDto, req.user.username);
  }

  @Get(':id/security')
  async security(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.securityDetails(id);
  }

  @Post(':id/status')
  async status(@Param('id', ParseIntPipe) id: number, @Body() body: UserStatusDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.changeStatus(id, body.status, body.reason, req.user.userId, req.user.username);
  }

  @Post(':id/revoke-sessions')
  async revokeSessions(@Param('id', ParseIntPipe) id: number, @Body() body: RevokeUserSessionsDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.revokeAllSessions(id, req.user.username, body.reason);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.deleteUser(id, req.user.userId, req.user.username);
  }
}
