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

function getUrl(targetUserId: string) {
  return `<%= basePath %><%= underscore(name) %>/${targetUserId}`;
}

export function post_<%= underscore(name) %>_userId(tools: Tools<%= classify(name) %>) {
  describe('POST <%= basePath %><%= underscore(name) %>/:userId', () => {
    let app: INestApplication;
    let userManager: UserTestManager;
    let service: <%= classify(name) %>Service;
    let createdListIds: string[];

    beforeAll(async () => {
      app = tools.app;
      userManager = tools.userManager;
      service = tools.service;
      createdListIds = [];
    });

    afterEach(async () => {
      await Promise.all(createdListIds.map((id) => service.delete(id)));
      createdListIds = [];
    });

    const testRequest = async (
      actorKey: DefaultUser<%= classify(name) %>,
      targetUserKey: DefaultUser<%= classify(name) %>,
      shouldSucceed: boolean,
      errorCode?: HttpStatus,
      originalData: any = { name: 'Created' },
      checkResultSucceed: (originalData: any, data: any) => void = (originalData: any, data) => {
        expect(data.name).toBe(originalData.name);
      },
    ) => {
      const actor = userManager.findUserByKey(actorKey);
      const targetUser = userManager.findUserByKey(targetUserKey);

      const response = await request(app.getHttpServer())
        .post(getUrl(targetUser.id))
        .set('Authorization', `Bearer ${actor.token}`)
        .send(originalData);

      if (
        response.status === HttpStatus.CREATED ||
        response.status === HttpStatus.OK
      ) {
        createdListIds.push(response.body.id);
      }

      if (shouldSucceed) {
        expect(response.status).toBe(HttpStatus.CREATED);
        checkResultSucceed(originalData, response.body);
        expect(response.body.year).toBe(new Date().getFullYear());
      } else {
        expect(response.status).toBe(errorCode);
      }
    };

    // Define Role Scenarios
    const sameGroupCreationTests = [
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.User,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.Technician,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.User,
      },
    ];

    sameGroupCreationTests.forEach((test) => {
      it(`${test.actor} can create a <%= classify(name) %> for ${
        test.target
      } in the same group ${getHttpStatusName(
        HttpStatus.CREATED,
      )}`, async () => {
        await testRequest(test.actor, test.target, true);
      });
    });

    const crossRoleRestrictionTests = [
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.Admin,
        shouldSucceed: false,
        errorCode: HttpStatus.FORBIDDEN,
      },
    ];

    crossRoleRestrictionTests.forEach((test) => {
      it(`${test.actor} cannot create a <%= classify(name) %> for ${
        test.target
      } in the same group ${getHttpStatusName(test.errorCode)}`, async () => {
        await testRequest(
          test.actor,
          test.target,
          test.shouldSucceed,
          test.errorCode,
        );
      });
    });

    const sameGroupRoles = [
      DefaultUser<%= classify(name) %>.Admin,
      DefaultUser<%= classify(name) %>.Technician,
      DefaultUser<%= classify(name) %>.User,
    ];
    const differentGroupRoles = [
      DefaultUser<%= classify(name) %>.UserNotSameGroup,
      DefaultUser<%= classify(name) %>.UserNoGroup,
    ];

    // Generate crossGroupTests dynamically
    const crossGroupTests = [];
    sameGroupRoles.forEach((sameGroupRole) => {
      differentGroupRoles.forEach((differentGroupRole) => {
        crossGroupTests.push({
          actor: sameGroupRole,
          target: differentGroupRole,
          errorCode: HttpStatus.FORBIDDEN,
          shouldSucceed: false,
          description: 'different',
        });
      });
    });

    crossGroupTests.forEach((test) => {
      it(`${test.actor} cannot create a <%= classify(name) %> for ${
        test.target
      } in a ${test.description} group ${getHttpStatusName(
        test.errorCode,
      )}`, async () => {
        await testRequest(
          test.actor,
          test.target,
 	        test.shouldSucceed,
          test.errorCode,
        );
      });
    });

    const selfCreationTests = [
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
    ];

    selfCreationTests.forEach((test) => {
      it(`${
        test.actor
      } can create a <%= classify(name) %> for themselves ${getHttpStatusName(
        HttpStatus.CREATED,
      )}`, async () => {
        await testRequest(test.actor, test.actor, test.shouldSucceed);
      });
    });

    const userCreatingForOthersTests = [
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.Admin,
        errorCode: HttpStatus.FORBIDDEN,
        shouldSucceed: false,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.Technician,
        errorCode: HttpStatus.FORBIDDEN,
        shouldSucceed: false,
      },
    ];

    userCreatingForOthersTests.forEach((test) => {
      it(`${test.actor} cannot create a <%= classify(name) %> for ${
        test.target
      }, regardless of the group ${getHttpStatusName(
        test.errorCode,
      )}`, async () => {
        await testRequest(
          test.actor,
          test.target,
          test.shouldSucceed,
          test.errorCode,
        );
      });
    });

    // Year Change Restriction Tests
    const allRoles = [
      DefaultUser<%= classify(name) %>.Admin,
      DefaultUser<%= classify(name) %>.Technician,
      DefaultUser<%= classify(name) %>.User,
    ];

    allRoles.forEach((actorRole) => {
      allRoles.forEach((targetRole) => {
        // Ajouter une condition pour ignorer certains tests
        if (
          !(
            (actorRole === DefaultUser<%= classify(name) %>.Technician &&
              targetRole === DefaultUser<%= classify(name) %>.Admin) ||
            (actorRole === DefaultUser<%= classify(name) %>.User &&
              (targetRole === DefaultUser<%= classify(name) %>.Admin ||
                targetRole === DefaultUser<%= classify(name) %>.Technician))
          )
        ) {
          it(`${actorRole} cannot change the year when creating a <%= classify(name) %> for ${targetRole} ${getHttpStatusName(
            HttpStatus.CREATED,
          )}`, async () => {
            await testRequest(actorRole, targetRole, true, undefined, {
              year: getCurrentYear() - 1,
            });
          });
        }
      });
    });

    it('Unauthorized Access Without Token', async () => {
      const user = userManager.findUserByKey('user');
      const data = {};

      const response = await request(app.getHttpServer())
        .post(getUrl(user.id))
        .send(data);

      if (
        response.status === HttpStatus.CREATED ||
        response.status === HttpStatus.OK
      ) {
        createdListIds.push(response.body.id);
      }
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('NotFound for Non-Existing User', async () => {
      const admin = userManager.findUserByKey('admin');
      const data = {};

      const response = await request(app.getHttpServer())
        .post(getUrl(uuidv4()))
        .set('Authorization', `Bearer ${admin.token}`)
        .send(data);
      if (
        response.status === HttpStatus.CREATED ||
        response.status === HttpStatus.OK
      ) {
        createdListIds.push(response.body.id);
      }
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
}
