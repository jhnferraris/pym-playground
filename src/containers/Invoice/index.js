import React, { Component } from 'react'
import Modal from 'react-responsive-modal'
import { v4 as uuidv4 } from 'uuid';
import { isEmptyObject } from '../../utils'

class PaymentMethods extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false,
            loading: false,
            showCreditCardForm: false,
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


    genericRequestFn = async (requestMethod, requestBody, url)  => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${btoa(process.env.REACT_APP_VAULT_SECRET_KEY)}`
            },
            method: requestMethod,
            body: JSON.stringify(requestBody)
        };
    
        try {
          const apiUrl = 'https://pg-sandbox.paymaya.com';
          const apiCall = await fetch(`${apiUrl}${url}`, config);
          const response = await apiCall.json();
    
          if (
              apiCall.status === 200
          ) {
              this.setState({
                bodyResponse: response,
              })
          } else {
              throw response;
          }
        } catch (err) {
          console.error(err);
        }

    }

    onCloseModal = () => {
        this.setState({
            open: false,
            bodyResponse: {},
            errorResponse: {},
            loading: false
        })
    }

    handleInvoice = () => {
      const { requestReferenceNumber, items, metadata, redirectUrl } = this.state

      const subTotalValue = items.reduce((total, item) => total + item.quantity * item.totalAmount.value, 0);
      const bodyForInvoice = {
        requestReferenceNumber,
        invoiceNumber: `INV-${requestReferenceNumber}`,
        totalAmount: {
            amount: subTotalValue,
            currency: 'PHP',
        },
        items,
        metadata,
        redirectUrl,
      }
      this.genericRequestFn('POST', bodyForInvoice, '/invoice/v2/invoices');
    }

    render() {
        const { bodyResponse, errorResponse, open, loading, items, requestReferenceNumber } = this.state
        const item = items[0]
        const subTotalValue = items.reduce((total, item) => total + item.quantity * item.totalAmount.value, 0);
        const checkoutForm = (
            <div>
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
                    <button onClick={this.handleInvoice} type="button">Generate Invoice</button>
            </div>
        )
        return (
            <div>
                <div className="form">
                    <h2>Credit card</h2>
                    {checkoutForm}
                    <div>&nbsp;</div>
                    <div id="iframe-container" />
                </div>
                <Modal
                    open={open}
                    onClose={this.onCloseModal}

                >
                    {!isEmptyObject(bodyResponse) && <pre>{JSON.stringify(bodyResponse, null, 2)}</pre>}
                    {!isEmptyObject(errorResponse) && <pre style={{backgroundColor: 'red', color: '#ffffff'}}>{JSON.stringify(errorResponse, null, 2)}</pre>}
                    <div style={{display: 'flex', justifyContent: 'center', margin: '0 auto'}} className="form">
                    {!loading && <button onClick={() => this.onCloseModal()} type="button">OK</button> }
                    {loading && <img src="/img/loading.gif" alt="" /> }
                    </div>
                </Modal>
            </div>
        );
    }
}

export default PaymentMethods;
