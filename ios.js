import base64 from 'base-64';
import parse from 'nextstep-plist/code/parse';
import iapReceiptValidator from 'iap-receipt-validator';


export default function verify(transaction, connectKey) {
    try {
        let t = transaction.transactionReceipt;
        t = base64.decode(t);
        t = parse(t);
        t = t['purchase-info'];
        t = base64.decode(t);
        t = parse(t);
        t = t['transaction-id'];
        if (t != transaction.transactionIdentifier) {
            let err = new Error('Purchase or subscribe is not verified');
            err.transactionDetails = transaction;
            return Promise.reject(err);
        }
    }
    catch (ex) { }

    return iapReceiptValidator(connectKey, true)(transaction.transactionReceipt)
        .catch(err => {
            if (err && err.redirect) {
                return iapReceiptValidator(connectKey, false)(transaction.transactionReceipt);
            }
            else {
                throw err;
            }
        })
        .then(data => {
            if (data.receipt && data.receipt.transaction_id == transaction.transactionIdentifier) {
                transaction = { ...transaction };

                if (data.status === 21006) {
                    if (data.is_in_billing_retry_period === '1') {
                        transaction.state = 'grace';
                    }
                    else {
                        transaction.state = 'expired';
                    }
                }
                else {
                    transaction.state = 'purchased';
                }

                transaction.autoRenewing = data.auto_renew_status === 1;

                return transaction;
            }
            else {
                let err = new Error('Purchase or subscribe is not verified');
                err.transactionDetails = transaction;
                throw err;
            }
        }, err => {
            if (!err || err.error === undefined) {
                return transaction;
            }
            else {
                let err = new Error('Purchase or subscribe is not verified');
                err.transactionDetails = transaction;
                throw err;
            }
        });
}