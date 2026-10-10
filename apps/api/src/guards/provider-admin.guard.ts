import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ProviderAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-provider-api-key'];
    
    if (!apiKey || apiKey !== process.env.PROVIDER_API_KEY) {
      throw new UnauthorizedException('Invalid Provider API Key');
    }
    
    return true;
  }
}
