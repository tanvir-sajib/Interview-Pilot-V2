import { Controller, Get } from "@nestjs/common";
import { HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { status: "ok" };
  }
}
