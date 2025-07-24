import { Body, Controller, Post, UseGuards, Get, Param } from '@nestjs/common';
import { LicenseService } from '../services/license.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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
    },
  ): Promise<void> {
    const { orgdid, liveliness_count, match_count, search_count } = body;
    return this.licenseService.logUsage(
      orgdid,
      liveliness_count,
      match_count,
      search_count,
    );
  }
}
