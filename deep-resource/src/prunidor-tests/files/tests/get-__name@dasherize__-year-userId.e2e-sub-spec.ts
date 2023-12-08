import { getHttpStatusName } from '@Helper/test-utils/common-test-utils';
import { UserTestManager } from '@Helper/test-utils/users-test-utils';
import { <%= classify(name) %>Service } from '@<%= classify(name) %>/<%= dasherize(name) %>.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import {
  DefaultUser<%= classify(name) %>,
  Tools<%= classify(name) %>,
} from '../<%= dasherize(name) %>.e2e-spec';

function getUrl(targetUserId: string, year: number) {
  return `<%= basePath %><%= underscore(name) %>/${year}/${targetUserId}`;
}

export function get_<%= underscore(name) %>_year_userId(tools: Tools<%= classify(name) %>) {
  describe('GET <%= basePath %><%= underscore(name) %>/:year/:userId', () => {
    let toDelete: string[];

    let app: INestApplication;
    let userManager: UserTestManager;
    let service: <%= classify(name) %>Service;

    beforeAll(async () => {
      app = tools.app;
      userManager = tools.userManager;
      service = tools.service;

      const currentYear = new Date().getFullYear();
      const users = [
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.Admin),
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.Technician),
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.User),
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.User2),
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.UserNoGroup),
        userManager.findUserByKey(DefaultUser<%= classify(name) %>.UserNotSameGroup),
      ];

      toDelete = [];

      for (const user of users) {
        const visualControl = await service.create({
          year: currentYear,
          user_id: user.id,
        });
        toDelete.push(visualControl.id);
        if (currentYear !== new Date().getFullYear()) {
          const previousYear = await service.create({
            year: currentYear - 1,
            user_id: user.id,
          });
          toDelete.push(previousYear.id);
        }
      }
    });

    afterAll(async () => {
      const deletePromises = toDelete.map((id) => service.delete(id));
      await Promise.all(deletePromises);
    });

    const testRequest = async (
      requesterKey: DefaultUser<%= classify(name) %>,
      targetUserKey: DefaultUser<%= classify(name) %>,
      year: number, // ou autre paramètre selon votre besoin
      expectedStatus: HttpStatus,
    ) => {
      const requester = userManager.findUserByKey(requesterKey);
      const targetUser = userManager.findUserByKey(targetUserKey);

      const response = await request(app.getHttpServer())
        .get(getUrl(targetUser.id, year))
        .set('Authorization', `Bearer ${requester.token}`);

      expect(response.status).toBe(expectedStatus);

      if (expectedStatus === HttpStatus.OK) {
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((responseOne) => {
          expect(responseOne.year).toBe(year);
        });
      }
    };

    const roles = [
      DefaultUser<%= classify(name) %>.Admin,
      DefaultUser<%= classify(name) %>.Technician,
      DefaultUser<%= classify(name) %>.User,
    ];
    const targetUsers = [
      DefaultUser<%= classify(name) %>.Admin,
      DefaultUser<%= classify(name) %>.Technician,
      DefaultUser<%= classify(name) %>.User,
      DefaultUser<%= classify(name) %>.UserNotSameGroup,
    ];
    const years = [
      new Date().getFullYear(),
      new Date().getFullYear() - 1,
      new Date().getFullYear() + 1,
      NaN,
    ];

    roles.forEach((requesterRole) => {
      targetUsers.forEach((targetUserRole) => {
        years.forEach((year) => {
          let expectedStatus;

          if (
            requesterRole === DefaultUser<%= classify(name) %>.Technician &&
            targetUserRole === DefaultUser<%= classify(name) %>.Admin
          ) {
            expectedStatus = HttpStatus.FORBIDDEN;
          } else if (
            requesterRole !== targetUserRole &&
            targetUserRole === DefaultUser<%= classify(name) %>.UserNotSameGroup
          ) {
            expectedStatus = HttpStatus.FORBIDDEN;
          } else if (
            requesterRole === DefaultUser<%= classify(name) %>.User &&
            requesterRole !== targetUserRole
          ) {
            expectedStatus = HttpStatus.FORBIDDEN;
          } else if (isNaN(year)) {
            expectedStatus = HttpStatus.UNPROCESSABLE_ENTITY;
          } else {
            expectedStatus = HttpStatus.OK;
          }

          it(`${requesterRole} requesting <%= classify(name) %> for ${targetUserRole} in year ${year} should result in ${getHttpStatusName(
            expectedStatus,
          )}`, async () => {
            await testRequest(
              requesterRole,
              targetUserRole,
              year,
              expectedStatus,
            );
          });
        });
      });
    });

    it('Unauthorized Access Without Token', async () => {
      const currentYear = new Date().getFullYear();
      const user = userManager.findUserByKey('user');

      const response = await request(app.getHttpServer())
        .get(getUrl(user.id, currentYear))
        .set('Authorization', `Bearer `);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Forbidden Access for Different User (Regular User)', async () => {
      await testRequest(
        DefaultUser<%= classify(name) %>.User,
        DefaultUser<%= classify(name) %>.Admin,
        new Date().getFullYear(),
        HttpStatus.FORBIDDEN,
      );
    });

    it('NotFound for Non-Existing User', async () => {
    	const currentYear = new Date().getFullYear();
    	const user = userManager.findUserByKey('user');

    	const response = await request(app.getHttpServer())
        .get(getUrl(uuidv4(), currentYear))
        .set('Authorization', `Bearer ${user.token}`);

    	expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
}
