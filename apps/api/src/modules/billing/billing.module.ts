import { Module } from "@nestjs/common";
import { UsageModule } from "../usage/usage.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [UsageModule, AuditModule],
})
export class BillingModule {}
