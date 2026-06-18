import { Module } from '@nestjs/common';

import { RuleLogsController } from './rule-logs.controller';
import { RuleLogsService } from './rule-logs.service';

@Module({ controllers: [RuleLogsController], providers: [RuleLogsService] })
export class RuleLogsModule {}
