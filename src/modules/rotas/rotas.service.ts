import { Injectable } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { RouteInfo } from './interfaces/route-info.interface';

@Injectable()
export class RotasService {
  constructor(
    private readonly modulesContainer: ModulesContainer,
    private readonly reflector: Reflector,
  ) {}

  getAllRoutes(): RouteInfo[] {
    const routes: RouteInfo[] = [];

    // Iterar através de todos os módulos
    this.modulesContainer.forEach((module) => {
      // Obter todos os controllers do módulo
      const controllers = module.controllers;

      controllers.forEach((controller: InstanceWrapper) => {
        const { instance, metatype } = controller;

        if (!instance || !metatype) return;

        // Obter o path base do controller
        const controllerPath =
          this.reflector.get<string>(PATH_METADATA, metatype) || '';
        const controllerName = metatype.name;

        // Obter todos os métodos do controller
        const prototype = Object.getPrototypeOf(instance);
        const methodNames = Object.getOwnPropertyNames(prototype).filter(
          (item) =>
            typeof prototype[item] === 'function' && item !== 'constructor',
        );

        methodNames.forEach((methodName) => {
          const method = prototype[methodName];

          // Obter metadados da rota
          const routePath =
            this.reflector.get<string>(PATH_METADATA, method) || '';
          const httpMethod = this.reflector.get<string>(
            METHOD_METADATA,
            method,
          );

          if (httpMethod) {
            const fullPath = this.buildFullPath(controllerPath, routePath);

            routes.push({
              controller: controllerName,
              path: routePath,
              method: httpMethod.toUpperCase(),
              endpoint: methodName,
              fullPath: fullPath,
            });
          }
        });
      });
    });

    // Ordenar rotas por controller e depois por path
    return routes.sort((a, b) => {
      if (a.controller !== b.controller) {
        return a.controller.localeCompare(b.controller);
      }
      return a.fullPath.localeCompare(b.fullPath);
    });
  }

  private buildFullPath(controllerPath: string, routePath: string): string {
    const base = controllerPath.startsWith('/')
      ? controllerPath
      : `/${controllerPath}`;
    const route = routePath.startsWith('/') ? routePath : `/${routePath}`;

    if (route === '/') {
      return base;
    }

    return `${base}${route}`.replace(/\/+/g, '/');
  }

  getRoutesByController(): Record<string, RouteInfo[]> {
    const allRoutes = this.getAllRoutes();
    const grouped: Record<string, RouteInfo[]> = {};

    allRoutes.forEach((route) => {
      if (!grouped[route.controller]) {
        grouped[route.controller] = [];
      }
      grouped[route.controller].push(route);
    });

    return grouped;
  }

  getRoutesByMethod(): Record<string, RouteInfo[]> {
    const allRoutes = this.getAllRoutes();
    const grouped: Record<string, RouteInfo[]> = {};

    allRoutes.forEach((route) => {
      if (!grouped[route.method]) {
        grouped[route.method] = [];
      }
      grouped[route.method].push(route);
    });

    return grouped;
  }
}
