export const BaseGatewayUrl = 'http://localhost:32791';
export const environment = {
    production: false,
    Product: {
        AddProductAsyncURL: `${BaseGatewayUrl}/productservice/product/AddProductAsync`,
        UpdateProductAsyncURL: `${BaseGatewayUrl}/productservice/Product/UpdateProductAsync`,
        DeleteProductAsyncURL: `${BaseGatewayUrl}/productservice/Product/DeleteProductAsync`,
        GetProductPageURL: `${BaseGatewayUrl}/productservice/product/GetProductPage`,
        AdminGetProductPageURL: `${BaseGatewayUrl}/productservice/product/AdminGetProductPage`,
        GetAllOrderdIdAsendingURL: `${BaseGatewayUrl}/productservice/product/GetAllOrderdIdAsending`,
    },
    Account: {
        RegisterURL: `${BaseGatewayUrl}/auth/account/Register`,
        TokenURL: `${BaseGatewayUrl}/auth/account/Token`,
        SetPasswordURL: `${BaseGatewayUrl}/auth/account/SetPassword`,
        ForrgotPasswordURL: `${BaseGatewayUrl}/auth/account/ForgetPassword`
    },
    file: {
        GetFileURL: `${BaseGatewayUrl}/processservice/file/files`,
    }
};
