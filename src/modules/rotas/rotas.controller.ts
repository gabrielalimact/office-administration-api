import { Controller, Get, Query } from '@nestjs/common';
import { RotasService } from './rotas.service';
import { RouteInfo } from './interfaces/route-info.interface';

@Controller('rotas')
export class RotasController {
  constructor(private readonly rotasService: RotasService) {}

  @Get()
  getAllRoutes(@Query('grouped') grouped?: string): {
    message: string;
    total?: number;
    data: RouteInfo[] | Record<string, RouteInfo[]>;
  } {
    if (grouped === 'controller') {
      return {
        message: 'Rotas agrupadas por controller',
        data: this.rotasService.getRoutesByController(),
      };
    }

    if (grouped === 'method') {
      return {
        message: 'Rotas agrupadas por método HTTP',
        data: this.rotasService.getRoutesByMethod(),
      };
    }

    const routes = this.rotasService.getAllRoutes();
    return {
      message: 'Lista de todas as rotas da API',
      total: routes.length,
      data: routes,
    };
  }

  @Get('controllers')
  getRoutesByController(): {
    message: string;
    data: Record<string, RouteInfo[]>;
  } {
    return {
      message: 'Rotas agrupadas por controller',
      data: this.rotasService.getRoutesByController(),
    };
  }

  @Get('methods')
  getRoutesByMethod(): {
    message: string;
    data: Record<string, RouteInfo[]>;
  } {
    return {
      message: 'Rotas agrupadas por método HTTP',
      data: this.rotasService.getRoutesByMethod(),
    };
  }

  @Get('summary')
  getRoutesSummary() {
    const allRoutes = this.rotasService.getAllRoutes();
    const byController = this.rotasService.getRoutesByController();
    const byMethod = this.rotasService.getRoutesByMethod();

    const controllers = Object.keys(byController);
    const methods = Object.keys(byMethod);

    return {
      message: 'Resumo das rotas da API',
      summary: {
        totalRoutes: allRoutes.length,
        totalControllers: controllers.length,
        availableMethods: methods,
        routesByMethod: Object.fromEntries(
          methods.map((method) => [method, byMethod[method].length]),
        ),
        routesByController: Object.fromEntries(
          controllers.map((controller) => [
            controller,
            byController[controller].length,
          ]),
        ),
      },
    };
  }
}
