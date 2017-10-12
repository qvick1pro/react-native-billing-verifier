import iapReceiptValidator from 'iap-receipt-validator';


export default function verify(transactionDetails, connectKey) {
    return iapReceiptValidator(connectKey, true)(transactionDetails.transactionReceipt)
        .then(data => {
            if (data.receipt &&
                data.receipt.product_id == transactionDetails.productIdentifier &&
                data.receipt.transaction_id == transactionDetails.transactionIdentifier) {
                return transactionDetails;
            }
            else {
                throw new Error('Purchase or subscribe is not verified');
            }
        },
        err => {
            if (err.redirect) {
                return transactionDetails;
            }
            else {
                throw new Error('Purchase or subscribe is not verified');
            }
        });
}