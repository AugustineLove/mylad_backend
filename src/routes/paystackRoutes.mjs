
import { Router } from "express";

import https from 'https'
import { initializePayment, verifyPayment } from "../controllers/paystackController.mjs";
const paystackRoutes = Router();

paystackRoutes.post('/initialize', initializePayment)
paystackRoutes.get('/verify', verifyPayment)

paystackRoutes.get('/', (req, res) => {

const params = JSON.stringify({
  "email": "customer@email.com",
  "amount": "20000"
})

const options = {
  hostname: 'api.paystack.co',
  port: 443,
  path: '/transaction/initialize',
  method: 'POST',
  headers: {
    Authorization: 'Bearer sk_test_3254ba35fb6dbd555ba2cf6453ec16f5e6ef53a7',
    'Content-Type': 'application/json'
  }
}

const reqpaystack = https.request(options, res => {
  let data = ''

  res.on('data', (chunk) => {
    data += chunk
  });

  res.on('end', () => {
    console.log(JSON.parse(data))
  })
}).on('error', error => {
  console.error(error)
})

reqpaystack.write(params)
reqpaystack.end()
})

export default paystackRoutes;