import { v4 as generateUUID } from 'uuid';
import { model as Coupon } from '../../../../website/server/models/coupon';
import { generateUser } from '../../../helpers/api-unit.helper';

describe('Coupon Model', () => {
  let user;

  beforeEach(async () => {
    user = await generateUser();
  });

  afterEach(() => sandbox.restore());

  describe('Schema Validation', () => {
    it('creates a coupon with auto-generated code', async () => {
      const coupon = new Coupon({
        event: 'wondercon',
      });

      await coupon.save();
      expect(coupon._id).to.exist;
      expect(coupon._id).to.be.a('string');
      expect(coupon.event).to.equal('wondercon');
    });

    it('validates event enum values', async () => {
      const coupon = new Coupon({
        event: 'invalid_event',
      });

      await expect(coupon.validate()).to.be.rejected;
    });

    it('allows user field to be empty initially', async () => {
      const coupon = new Coupon({
        event: 'wondercon',
      });

      await coupon.save();
      expect(coupon.user).to.be.undefined;
    });
  });

  describe('Static Method: generate', () => {
    it('generates a single coupon by default', async () => {
      const coupons = await Coupon.generate('wondercon');

      expect(coupons).to.be.an('array');
      expect(coupons).to.have.lengthOf(1);
      expect(coupons[0].event).to.equal('wondercon');
    });

    it('generates multiple coupons when count is specified', async () => {
      const coupons = await Coupon.generate('google_6mo', 5);

      expect(coupons).to.have.lengthOf(5);
      coupons.forEach(coupon => {
        expect(coupon.event).to.equal('google_6mo');
      });
    });

    it('generates coupons with unique codes', async () => {
      const coupons = await Coupon.generate('wondercon', 10);

      const codes = coupons.map(c => c._id);
      const uniqueCodes = [...new Set(codes)];
      expect(uniqueCodes).to.have.lengthOf(10);
    });
  });

  describe('Static Method: apply', () => {
    let coupon;
    let req;

    beforeEach(async () => {
      coupon = await Coupon.create({ event: 'wondercon' });
      req = {
        language: 'en',
      };
    });

    it('applies wondercon coupon and grants items', async () => {
      await Coupon.apply(user, req, coupon._id);

      expect(user.items.gear.owned.eyewear_special_wondercon_red).to.equal(true);
      expect(user.items.gear.owned.back_special_wondercon_black).to.equal(true);
    });

    it('marks coupon as used by user', async () => {
      await Coupon.apply(user, req, coupon._id);

      const updatedCoupon = await Coupon.findById(coupon._id).exec();
      expect(updatedCoupon.user).to.equal(user._id);
    });

    it('throws BadRequest for non-existent coupon', async () => {
      const fakeCouponCode = 'AAAA-BBBB-CCCC';

      try {
        await Coupon.apply(user, req, fakeCouponCode);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.name).to.equal('BadRequest');
      }
    });

    it('throws NotAuthorized when coupon already used', async () => {
      await Coupon.apply(user, req, coupon._id);

      const anotherUser = await generateUser();

      try {
        await Coupon.apply(anotherUser, req, coupon._id);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.name).to.equal('NotAuthorized');
      }
    });

    it('handles case-insensitive coupon codes', async () => {
      const lowerCaseCode = coupon._id.toLowerCase();

      await Coupon.apply(user, req, lowerCaseCode);

      const updatedCoupon = await Coupon.findById(coupon._id).exec();
      expect(updatedCoupon.user).to.equal(user._id);
    });
  });

  describe('Timestamps', () => {
    it('automatically adds createdAt timestamp', async () => {
      const coupon = new Coupon({
        event: 'wondercon',
      });

      await coupon.save();
      expect(coupon.createdAt).to.exist;
      expect(coupon.createdAt).to.be.a('date');
    });
  });

  describe('BaseModel Plugin', () => {
    it('uses custom _id instead of ObjectId', async () => {
      const coupon = await Coupon.create({ event: 'wondercon' });

      expect(coupon._id).to.be.a('string');
      expect(coupon._id).to.not.be.an('object');
    });
  });
});
