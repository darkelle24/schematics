import { getCurrentYear } from '@Helper/fn/get-current-year.helper';
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

function getUrl(targetUserId: string, <%= camelize(name) %>Id: string) {
  return `<%= basePath %><%= underscore(name) %>/${targetUserId}/${<%= camelize(name) %>Id}`;
}

export function delete_<%= underscore(name) %>_userId_<%= camelize(name) %>Id(
  tools: Tools<%= classify(name) %>,
) {
  describe('DELETE <%= basePath %><%= underscore(name) %>/:userId/:<%= camelize(name) %>Id', () => {
    let app: INestApplication;
    let userManager: UserTestManager;
    let service: <%= classify(name) %>Service;
    let createdListIds: string[] = [];

    beforeAll(async () => {
      app = tools.app;
      userManager = tools.userManager;
      service = tools.service;
    });

    afterEach(async () => {
      await Promise.all(
        createdListIds.map(async (id) => {
          await service.delete(id);
        }),
      );
      createdListIds = [];
    });

    const testRequest = async (
      actorKey: string,
      targetUserKey: string,
      shouldSucceed: boolean,
      errorCode?: HttpStatus,
      year: number = new Date().getFullYear(),
    ) => {
      const actor = userManager.findUserByKey(actorKey);
      const targetUser = userManager.findUserByKey(targetUserKey);

      const createdEntity = await service.create({
        user_id: targetUser.id,
        year: year,
      });

      createdListIds.push(createdEntity.id);

      const response = await request(app.getHttpServer())
        .delete(getUrl(targetUser.id, createdEntity.id))
        .set('Authorization', `Bearer ${actor.token}`);

      if (shouldSucceed) {
        expect(response.status).toBe(HttpStatus.OK);
        const index = createdListIds.indexOf(createdEntity.id);
        if (index > -1) {
          createdListIds.splice(index, 1);
        }
      } else {
        expect(response.status).toBe(errorCode);
      }
    };

    const deleteScenarios = [
      // Mêmes groupes
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.Technician,
        shouldSucceed: true,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: true,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: true,
      },

      // Restrictions inter-rôles
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.Admin,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.Admin,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.Technician,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.User2,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },

      // Groupes croisés
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.UserNotSameGroup,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.UserNotSameGroup,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.UserNotSameGroup,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },

      // Auto-suppression
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: true,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.Admin,
        shouldSucceed: true,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.Technician,
        shouldSucceed: true,
      },

      // Restriction sur la suppression d'années antérieures
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.User,
        year: new Date().getFullYear() - 1,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.User,
        year: new Date().getFullYear() - 1,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.User,
        year: new Date().getFullYear() - 1,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
    ];

    for (const scenario of deleteScenarios) {
      const { actor, target, shouldSucceed, errorCode, year } = scenario;

      it(`should${
        shouldSucceed ? '' : ' not'
      } allow ${actor} to delete <%= classify(name) %> of ${target} for year ${
        year ? year : getCurrentYear()
      } ${getHttpStatusName(
        shouldSucceed ? HttpStatus.OK : errorCode,
      )}`, async () => {
        await testRequest(actor, target, shouldSucceed, errorCode, year);
      });
    }

    it('Unauthorized Access Without Token', async () => {
      const user = userManager.findUserByKey(DefaultUser<%= classify(name) %>.User);
      const createdEntity = await service.create({
        user_id: user.id,
        year: new Date().getFullYear(),
      });

      const response = await request(app.getHttpServer()).delete(
        getUrl(user.id, createdEntity.id),
      );

      createdListIds.push(createdEntity.id);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('NotFound for Non-Existing User or <%= classify(name) %>', async () => {
      const admin = userManager.findUserByKey(DefaultUser<%= classify(name) %>.Admin);

      const response = await request(app.getHttpServer())
        .delete(getUrl(uuidv4(), uuidv4()))
        .set('Authorization', `Bearer ${admin.token}`);

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
}
