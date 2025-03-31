import dotenv from 'dotenv';

dotenv.config({ path: _dirname + `/../../.env` });

const config = {
  paystackSecret: process.env.PAYSTACK_SECRET,
  paystackUrl: process.env.PAYSTACK_BASE_URL
}

export default config;