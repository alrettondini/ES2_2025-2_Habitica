import { v4 as generateUUID } from 'uuid';
import {
  inviteByUUID,
  inviteByEmail,
  inviteByUserName,
} from '../../../../website/server/libs/invites';
import { model as User } from '../../../../website/server/models/user';
import { model as Group } from '../../../../website/server/models/group';
import { model as EmailUnsubscription } from '../../../../website/server/models/emailUnsubscription';

describe('Invites Library', () => {
  let inviter;
  let userToInvite;
  let guild;
  let party;
  let req;
  let res;

  beforeEach(async () => {
    inviter = new User({
      auth: {
        local: {
          username: 'inviter',
          lowerCaseUsername: 'inviter',
        },
      },
      profile: { name: 'Inviter User' },
    });
    await inviter.save();

    userToInvite = new User({
      auth: {
        local: {
          username: 'invitee',
          lowerCaseUsername: 'invitee',
          email: 'invitee@test.com',
        },
      },
      profile: { name: 'Invitee User' },
    });
    await userToInvite.save();

    guild = new Group({
      name: 'Test Guild',
      type: 'guild',
      privacy: 'private',
      leader: inviter._id,
    });
    await guild.save();

    party = new Group({
      name: 'Test Party',
      type: 'party',
      leader: inviter._id,
    });
    await party.save();

    req = {
      body: {},
      headers: {},
    };

    res = {
      t: sinon.stub().callsFake(key => key),
      analytics: {
        track: sinon.stub(),
      },
    };
  });

  afterEach(() => sandbox.restore());

  describe('inviteByUUID', () => {
    it('successfully invites a user to a guild by UUID', async () => {
      const invitation = await inviteByUUID(userToInvite._id, guild, inviter, req, res);

      expect(invitation).to.exist;
      expect(invitation.id).to.equal(guild._id);
      expect(invitation.name).to.equal(guild.name);
    });

    it('successfully invites a user to a party by UUID', async () => {
      const invitation = await inviteByUUID(userToInvite._id, party, inviter, req, res);

      expect(invitation).to.exist;
      expect(invitation.id).to.equal(party._id);
    });

    it('throws NotFound when user does not exist', async () => {
      const fakeUUID = generateUUID();

      await expect(
        inviteByUUID(fakeUUID, guild, inviter, req, res)
      ).to.be.rejected;
    });

    it('throws BadRequest when inviting self', async () => {
      await expect(
        inviteByUUID(inviter._id, guild, inviter, req, res)
      ).to.be.rejected;
    });

    it('throws NotAuthorized when user already in guild', async () => {
      userToInvite.guilds.push(guild._id);
      await userToInvite.save();

      await expect(
        inviteByUUID(userToInvite._id, guild, inviter, req, res)
      ).to.be.rejected;
    });

    it('tracks analytics for invitations', async () => {
      await inviteByUUID(userToInvite._id, guild, inviter, req, res);

      expect(res.analytics.track).to.have.been.calledWith('group invite');
    });
  });

  describe('inviteByEmail', () => {
    it('invites existing user by email', async () => {
      const invite = { email: 'invitee@test.com' };

      const result = await inviteByEmail(invite, guild, inviter, req, res);

      expect(result).to.exist;
      expect(result.id).to.equal(guild._id);
    });

    it('sends invitation email to non-existing user', async () => {
      const invite = { email: 'newuser@test.com' };

      const result = await inviteByEmail(invite, guild, inviter, req, res);

      expect(result).to.equal('newuser@test.com');
    });

    it('throws BadRequest when email is missing', async () => {
      const invite = {};

      await expect(
        inviteByEmail(invite, guild, inviter, req, res)
      ).to.be.rejected;
    });

    it('does not send email to unsubscribed address', async () => {
      const invite = { email: 'unsubscribed@test.com' };
      await EmailUnsubscription.create({ email: 'unsubscribed@test.com' });

      const result = await inviteByEmail(invite, guild, inviter, req, res);

      expect(result).to.equal('unsubscribed@test.com');
    });

    it('finds user by Facebook email', async () => {
      const fbUser = new User({
        auth: {
          facebook: {
            emails: [{ value: 'facebook@test.com' }],
          },
        },
        profile: { name: 'FB User' },
      });
      await fbUser.save();

      const invite = { email: 'facebook@test.com' };
      const result = await inviteByEmail(invite, guild, inviter, req, res);

      expect(result.id).to.equal(guild._id);
    });
  });

  describe('inviteByUserName', () => {
    it('successfully invites user by username', async () => {
      const result = await inviteByUserName('invitee', guild, inviter, req, res);

      expect(result).to.exist;
      expect(result.id).to.equal(guild._id);
    });

    it('handles username with @ prefix', async () => {
      const result = await inviteByUserName('@invitee', guild, inviter, req, res);

      expect(result).to.exist;
    });

    it('handles case-insensitive usernames', async () => {
      const result = await inviteByUserName('INVITEE', guild, inviter, req, res);

      expect(result).to.exist;
    });

    it('throws NotFound when username does not exist', async () => {
      await expect(
        inviteByUserName('nonexistent', guild, inviter, req, res)
      ).to.be.rejected;
    });

    it('tracks analytics for username invitation', async () => {
      await inviteByUserName('invitee', party, inviter, req, res);

      expect(res.analytics.track).to.have.been.calledWith('group invite');
    });
  });
});
