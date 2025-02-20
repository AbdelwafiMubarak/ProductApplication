export const BaseGatewayUrl = 'https://localhost:32775';
export const environment = {
    production: false,
    Product: {
        AddProductAsyncURL: `${BaseGatewayUrl}/productservice/product/AddProductAsync`,
        UpdateProductAsyncURL: `${BaseGatewayUrl}/productservice/Product/UpdateProductAsync`,
        DeleteProductAsyncURL: `${BaseGatewayUrl}/productservice/Product/DeleteProductAsync`,
        GetProductPageURL: `${BaseGatewayUrl}/productservice/product/GetProductPage`,
    },
    Account: {
        RegisterURL: `${BaseGatewayUrl}/auth/account/Register`,
        TokenURL: `${BaseGatewayUrl}/auth/account/Token`,
        SetPasswordURL: `${BaseGatewayUrl}/auth/account/SetPassword`,
        ForrgotPasswordURL: `${BaseGatewayUrl}/auth/account/ForgetPassword`
    },
};
