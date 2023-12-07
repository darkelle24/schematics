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

export function put_<%= underscore(name) %>_userId_<%= camelize(name) %>Id(
  tools: Tools<%= classify(name) %>,
) {
  describe('PUT <%= basePath %><%= underscore(name) %>/:userId/:<%= camelize(name) %>Id', () => {
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
      await Promise.all(createdListIds.map((id) => service.delete(id)));
      createdListIds = [];
    });

    const testRequest = async (
      actorKey: string,
      targetUserKey: string,
      shouldSucceed: boolean,
      errorCode?: HttpStatus,
      originalData: any = { name: 'Created' },
      updateData: any = { name: 'Updated' },
      checkResultSucceed: (
        originalData: any,
        updateData: any,
        data: any,
      ) => void = (_originalData: any, updateData: any, data: any) => {
        expect(data.pest_name).toBe(updateData.pest_name);
      },
      year: number = new Date().getFullYear(),
    ) => {
      const actor = userManager.findUserByKey(actorKey);
      const targetUser = userManager.findUserByKey(targetUserKey);
      const createdEntity = await service.create({
        ...originalData,
        user_id: targetUser.id,
        year: year,
      });

      createdListIds.push(createdEntity.id);

      const response = await request(app.getHttpServer())
        .put(getUrl(targetUser.id, createdEntity.id))
        .set('Authorization', `Bearer ${actor.token}`)
        .send(updateData);

      if (shouldSucceed) {
        expect(response.status).toBe(HttpStatus.OK);
        checkResultSucceed(originalData, updateData, response.body);
        expect(response.body.year).toBe(new Date().getFullYear());
      } else {
        expect(response.status).toBe(errorCode);
      }
    };

    const sameGroupUpdateTests = [
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
    ];

    sameGroupUpdateTests.forEach((test) => {
      it(`${test.actor} should be able to update <%= classify(name) %> for ${
        test.target
      } in the same group ${getHttpStatusName(HttpStatus.OK)}`, async () => {
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
    ];

    crossRoleRestrictionTests.forEach((test) => {
      it(`${test.actor} should not be able to update <%= classify(name) %> for ${
        test.target
      } ${getHttpStatusName(test.errorCode)}`, async () => {
        await testRequest(test.actor, test.target, false, test.errorCode);
      });
    });

    const crossGroupTests = [
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
    ];

    crossGroupTests.forEach((test) => {
      it(`${test.actor} should not be able to update <%= classify(name) %> for ${
        test.target
      } in a different group ${getHttpStatusName(
        test.errorCode,
      )}`, async () => {
        await testRequest(test.actor, test.target, false, test.errorCode);
      });
    });

    const selfUpdateTests = [
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

    selfUpdateTests.forEach((test) => {
      it(`${
        test.actor
      } should be able to update their own <%= classify(name) %> ${getHttpStatusName(
        HttpStatus.OK,
      )}`, async () => {
        await testRequest(test.actor, test.actor, true);
      });
    });

    const yearChangeRestrictionTests = [
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.Technician,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Admin,
        target: DefaultUser<%= classify(name) %>.Admin,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.Technician,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.Technician,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
      {
        actor: DefaultUser<%= classify(name) %>.User,
        target: DefaultUser<%= classify(name) %>.User,
        shouldSucceed: false,
        year: new Date().getFullYear() - 1,
        errorCode: HttpStatus.FORBIDDEN,
      },
    ];

    yearChangeRestrictionTests.forEach((test) => {
      it(`${test.actor} should not be able to update the <%= classify(name) %> for ${
        test.target
      } if the <%= classify(name) %> year is not the current year ${getHttpStatusName(
        test.errorCode,
      )}`, async () => {
        await testRequest(
          test.actor,
          test.target,
          test.shouldSucceed,
          test.errorCode,
          undefined,
          undefined,
          undefined,
          test.year,
        );
      });
    });

    // Unauthorized Access Test
    it('Unauthorized Access Without Token', async () => {
      const user = userManager.findUserByKey(DefaultUser<%= classify(name) %>.User);
      const created = await service.create({
        user_id: user.id,
        year: new Date().getFullYear(),
      });

      const response = await request(app.getHttpServer())
        .put(getUrl(user.id, created.id))
        .send({ name: 'Updated' });

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);

      await service.delete(created.id);
    });

    // Not Found Test
    it('NotFound for Non-Existing User or <%= classify(name) %>', async () => {
      const admin = userManager.findUserByKey(DefaultUser<%= classify(name) %>.Admin);

      const response = await request(app.getHttpServer())
        .put(getUrl(uuidv4(), uuidv4()))
        .set('Authorization', `Bearer ${admin.token}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

  });
}
