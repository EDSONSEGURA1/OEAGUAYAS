import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const configuredKey = process.env.ADMIN_API_KEY;
    const providedKey = request.headers['x-admin-key'];

    if (!configuredKey || providedKey !== configuredKey) {
      throw new UnauthorizedException('API key de administrador inválida');
    }

    return true;
  }
}