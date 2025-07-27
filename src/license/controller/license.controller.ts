import { Body, Controller, Post, UseGuards, Get, Param, Put } from '@nestjs/common';
import { LicenseService } from '../services/license.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LicenseLimit } from '../interface/license.interface';

@Controller('license')
@ApiBearerAuth()
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Get('balance/:orgdid')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Checks the license balance for an organization',
    description: 'This endpoint checks if the license balance for an organization is sufficient.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns true if the balance is sufficient, false otherwise.',
  })
  async checkBalance(@Param('orgdid') orgdid: string): Promise<boolean> {
    return this.licenseService.checkBalance(orgdid);
  }

  @Post('usage')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Logs license usage for an organization',
    description: 'This endpoint logs license usage and updates the balance.',
  })
  @ApiResponse({
    status: 201,
    description: 'The usage has been successfully logged.',
  })
  async logUsage(
    @Body()
    body: {
      orgdid: string;
      liveliness_count?: number;
      match_count?: number;
      search_count?: number;
      response_from_server?: string;
    },
  ): Promise<void> {
    const { orgdid, liveliness_count, match_count, search_count, response_from_server } = body;
    return this.licenseService.logUsage(
      orgdid,
      liveliness_count,
      match_count,
      search_count,
      response_from_server,
    );
  }

  @Put('renew/:orgdid')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Renews a license for an organization',
    description: 'This endpoint renews a license and resets the usage.',
  })
  @ApiResponse({
    status: 200,
    description: 'The license has been successfully renewed.',
  })
  async renewSubscription(
    @Param('orgdid') orgdid: string,
    @Body()
    body: {
      renew_subscription?: boolean;
    },
  ): Promise<LicenseLimit> {
    const { renew_subscription } = body;
    return this.licenseService.renewSubscription(orgdid, renew_subscription);
  }
}
