import React, { Component } from 'react'
import paymaya from 'paymaya-js-sdk'
import Modal from 'react-responsive-modal'
import { v4 as uuidv4 } from 'uuid';

import { isEmptyObject } from '../../utils'

class Checkout extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false, 
            loading: false,
            // The value Request Reference Number (rrn) must be generated on the merchant's side.
            requestReferenceNumber: uuidv4(), 
            items: [
                {
                    name: "Nike Footwear",
                    quantity: 1,
                    "totalAmount": {
                        "value": 100,
                        "details": {
                          "discount": 0,
                          "serviceCharge": 0,
                          "shippingFee": 0,
                          "tax": 0,
                          "subtotal": 100
                        }
                    }
                }
            ],
            metadata: {},
            redirectUrl: {
                success: `${process.env.REACT_APP_URL}/success`,
                failure: `${process.env.REACT_APP_URL}/failure`,
                cancel: `${process.env.REACT_APP_URL}/cancel`,
            },
            bodyResponse: {},
            errorResponse: {}
        }
    }

    async createCheckout(response){
        this.setState({
            loading: true,
            errorResponse: {}
        })
        paymaya.init('pk-Z0OSzLvIcOI2UIvDhdTGVVfRSSeiGStnceqwUE7n0Ah', true)
        await paymaya.createCheckout(response).then().catch(err => {
            this.setState({
                errorResponse: err,
                loading: false
            })
        })
    }
    
    onCloseModal = () => {
        this.setState({
            open: false,
            bodyResponse: {},
            errorResponse: {},
            loading: false
        })
    }

    handleCheckout = () => {
        
        const { requestReferenceNumber, items, metadata, redirectUrl } = this.state

        const subTotalValue = items.reduce((total, item) => total + item.quantity * item.totalAmount.value, 0);
        const bodyResponseForCheckout = {
            requestReferenceNumber,
            totalAmount: {
                value: subTotalValue,
                currency: 'PHP',
                details: {
                    discount: 0,
                    serviceCharge: 0,
                    shippingFee: 0,
                    tax: 0,
                    subtotal: subTotalValue
                }
            },
            items,
            metadata,
            redirectUrl,
            buyer: {
                "firstName": "John",
                "middleName": "Paul",
                "lastName": "Doe",
                "birthday": "1995-10-24",
                "customerSince": "1995-10-24",
                "sex": "M",
                "contact": {
                  "phone": "+639181008888",
                  "email": "merchant@merchantsite.com"
                },
                "shippingAddress": {
                    "firstName": "John",
                    "middleName": "Paul",
                    "lastName": "Doe",
                    "phone": "+639181008888",
                    "email": "merchant@merchantsite.com",
                    "line1": "6F Launchpad",
                    "line2": "Reliance Street",
                    "city": "Mandaluyong City",
                    "state": "Metro Manila",
                    "zipCode": "1552",
                    "countryCode": "PH",
                    "shippingType": "ST" // ST - for standard, SD - for same day
                },
                "billingAddress": {
                  "line1": "6F Launchpad",
                  "line2": "Reliance Street",
                  "city": "Mandaluyong City",
                  "state": "Metro Manila",
                  "zipCode": "1552",
                  "countryCode": "PH"
                }
            },
            
        }

        this.setState({
            bodyResponse: bodyResponseForCheckout,
            open: true
        })
          
    }

    render() {
        const { bodyResponse, errorResponse, open, loading, items, requestReferenceNumber } = this.state
        const item = items[0]
        const subTotalValue = items.reduce((total, item) => total + item.quantity * item.totalAmount.value, 0);
        return (
            <div>
                <div className="form">
                    <h2>Checkout</h2>
                    <h3>Imagine this is your application's checkout form</h3>
                    <label>Order Reference Number
                        <input value = { requestReferenceNumber } readonly />
                    </label>
                    <label>Product Name
                        <input value = { item.name } readonly />
                    </label>
                    <label>Unit Price
                        <input value = { item.totalAmount.value } readonly />
                    </label>
                    <label>Quantity
                    <input value = { item.quantity } readonly /> 
                    </label> 
                   
                    <br/>
                    <label>Total Amount
                        <input value = { subTotalValue } readonly />
                    </label> 
                    <br/> 
                    <pre>Assume Buyer and shipping details were obtained from a previous step. Check the code for more info</pre>
                    <button onClick={this.handleCheckout} type="button">Checkout</button>
                </div>
                <Modal
                    open={open}
                    onClose={this.onCloseModal}

                >
                    {!isEmptyObject(bodyResponse) && <pre>{JSON.stringify(bodyResponse, null, 2)}</pre>}
                    {!isEmptyObject(errorResponse) && <pre style={{backgroundColor: 'red', color: '#ffffff'}}>{JSON.stringify(errorResponse, null, 2)}</pre>}
                    <div style={{display: 'flex', justifyContent: 'center', margin: '0 auto'}} className="form">
                    {!loading && <button onClick={() => this.createCheckout(bodyResponse)} type="button">OK</button> }
                    {loading && <img src="/img/loading.gif" alt="" /> }
                    </div>
                </Modal>
            </div>
        );
    }
}
  
export default Checkout;