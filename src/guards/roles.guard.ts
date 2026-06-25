import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No roles required for this route
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard

    if (!user || !user.role) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }
}
