import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  issueOnlineLease,
  type LeaseRequest,
} from '@evergreen/types/licensing-online';
import { PublicAuthRateLimitGuard } from '../../guards/public-order-rate-limit.guard';

@Controller('licensing')
export class OwnerLicensingController {
  /** Separate device-proof authentication; provider keys are never distributed to tenant installations. */
  @Post('lease')
  @UseGuards(PublicAuthRateLimitGuard)
  lease(@Body() request: LeaseRequest) {
    try {
      return issueOnlineLease(request);
    } catch {
      throw new ForbiddenException('Licence renewal was not authorized');
    }
  }
}
