import Fetch from "./core/fetch/Fetch";

class PaymentService {

    async getCheckout(type: string = 'premium', price: string = 'annually') {

        let res = await Fetch.postWithAccessToken<any>(`/api/subscription/product/get.checkout`, {
            type,
            price
        });

        return res.data?.code?.data?.attributes?.url;
    }



    async getPortal() {

        let res = await Fetch.postWithAccessToken<any>(`/api/subscription/product/get.portal`, {
        });

        return res.data?.code?.data?.attributes?.urls?.customer_portal || res.data?.code?.data?.attributes?.urls?.receipt;
    }
};


export default new PaymentService();