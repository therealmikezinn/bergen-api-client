let soap = require('soap');
let path = require('path');
let _    = require('lodash');
let mixin = require('merge-descriptors');

function BergenV3Api( options ) {

    if ( ! ( this instanceof BergenV3Api )) return new BergenV3Api(options);

    let self = this;
    let accessToken = null;
    let clientLib = null;

    const wsdls = {
        production: path.join(__dirname, 'wsdl', 'production', 'production.wsdl'),
        sandbox: path.join(__dirname, 'wsdl', 'sandbox', 'sandbox.wsdl')
    };

    const properties = {
        auth: {
            WebAddress: options.WebAddress,
            UserName: options.UserName,
            Password: options.Password
        },
        wsdl: wsdls[ options.environment || "sandbox" ]
    };

    /**
     *
     *
     *
     * @returns {Promise}
     */
    self.getClient = function () {

        return new Promise(function (resolve, reject) {

            if ( clientLib != null ) {

                process.nextTick(function () {

                    return resolve(clientLib);

                });


            } else {

                soap.createClient(properties.wsdl, function (params, client) {

                    if ( client != null ) {

                        clientLib = client;
                        return resolve( client );

                    } else {

                        return reject({error: "No Client Found"});

                    }

                });
            }

        });

    };

    /**
     *
     *
     *
     * @returns {Promise}
     *
     */
    self.getAccessToken = function (){


        return new Promise(function (resolve, reject) {

            if ( accessToken != null ) {

                process.nextTick(function () {

                    return resolve(accessToken);

                });

            } else {

                self.authenticate().then(function(result){

                    return resolve(result);

                }).catch(function(err){

                    return resolve(err);

                });

            }


        });

    };

    self.authenticate = function(){

        return new Promise(function(resolve, reject){

            self.getClient().then(function (client) {

                client.AuthenticationTokenGet(properties.auth, function (err, result) {

                    accessToken = { AuthenticationString: result.AuthenticationTokenGetResult };
                    resolve( Object.assign({}, accessToken ) );

                });

            }).catch(function (err) {

                reject(err);

            });

        }).catch(function(err){

            return reject(err);

        });


    };

}

/**
 *
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.buildRequest = function(mapKeyToLower, params) {

    let self = this;

    if( params == null && mapKeyToLower != null ){

        if( typeof (mapKeyToLower) === 'object' ){

            params = _.cloneDeep(mapKeyToLower)
            mapKeyToLower = false;

        }

    } else {

        mapKeyToLower = mapKeyToLower  != null ? mapKeyToLower : false;

    }

    return new Promise(function(resolve, reject){

        self.getAccessToken().then(function(token){

            self.getClient().then(function(client){

                if( client == null || token == null ){

                    return reject("error");

                }

                let body = Object.assign( {}, token );

                if( mapKeyToLower ){

                    body = { authenticationString: token.AuthenticationString };

                }

                if( params != null ){

                    _.merge( body, params );

                }


                let requestObj = {
                    client: client,
                    body: body
                };

                return resolve(requestObj);

            }).catch(function(err){

                console.log(err);

            });

        }).catch(function(err){

            return reject(err);

        });

    });

};


/**
 *
 *
 *
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getInventory = function() {

    let self = this;

    return new Promise(function(resolve, reject){

        self.buildRequest().then(function(request){

            request.client.GetInventory(request.body, function(err, result){

                if( err != null ){

                    return reject( err );

                } else {

                    return resolve( result );
                }

            });

        }).catch(function(err){

            return reject(err);

        });

    });
};

/**
 *
 * @param {object} params
 * @param {string} [params.FromDateTime] - Format mm/dd/yyyy hh24:mi:ss
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getInventoryFromDateTime = function(params){

    let self = this;

    return new Promise(function(resolve, reject){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetInventoryFromDateTime( request.body, function( err, result ){

                if( err != null ){
                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });


};

/**
 *
 * @param {object}  params
 * @param {string}  params.fromDateTime
 * @param {integer} params.batchNumber
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getInventoryFromDateTimeByBatch = function(params){

    let self = this;

    return new Promise(function(resolve, reject){


        self.buildRequest(true, params).then(function( request ){

            request.client.GetInventoryFromDateTimeByBatch(request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 *
 * @param {object} params
 * @param {array}  params.UPCs
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getInventoryByUPCs = function(params){

    let self = this;

    return new Promise(function(resolve, reject){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetInventoryByUPCs( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};


/**
 *
 * @param {object} params
 * @param {string} params.Style
 *
 *
 * @returns {Promise}
 *
 */

BergenV3Api.prototype.getInventoryByStyle = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetInventoryByStyle( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.StartDate
 * @param {string} params.EndDate
 *
 *
 * @returns {Promise}
 */

BergenV3Api.prototype.getReceivingStatusesByDate = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetReceivingStatusesByDate(request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.StartDate -- Format MM/DD/YYYY or MM/DD/YYYY HH:MI
 * @param {string} params.EndDate   -- Format MM/DD/YYYY or MM/DD/YYYY HH:MI
 * @param {string} params.dateType  -- Format
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getReceivingStatusesByDateConfigurable = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetReceivingStatusesByDateConfigurable( request.body, function( err, result ){

                if(err){

                    return reject(err);

                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });


};


/**
 *
 *
 * @param {object} params
 * @param {string} params.customerPO
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getReceivingTicketsByPO = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetReceivingTicketsByPO( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 *
 * @param {object} params
 * @param {string} params.AsnTicketNumber
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getReceivingTicketObjectByTicketNo = function(params){

    let self = this;

    return new Promise(function (resolve, reject) {

        self.buildRequest(false, params).then(function(request){

            request.client.GetReceivingTicketObjectByTicketNo(request.body, function(err, result ){

                if( err != null ){

                    return reject(err);

                } else {

                    return resolve(result);
                }

            });

        }).catch(function(err){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.ReceivingTicketStatus
 * @param {string} params.StartDate -- Format mm/dd/yyyy
 * @param {string} params.EndDate -- Format mm/dd/yyyy
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getReceivingTicketsByStatusAndCreateDate = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetReceivingTicketsByStatusAndCreateDate( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 *
 * @param {Object} params
 * @param {string} [params.receivingTicket.SupplierDetails.CompanyName]
 * @param {string} params.receivingTicket.SupplierDetails.Address1
 * @param {string} params.receivingTicket.SupplierDetails.Address2
 * @param {string} params.receivingTicket.SupplierDetails.City
 * @param {string} [params.receivingTicket.SupplierDetails.State]
 * @param {string} params.receivingTicket.SupplierDetails.Zip
 * @param {string} [params.receivingTicket.SupplierDetails.Country]
 * @param {string} params.receivingTicket.SupplierDetails.Non_US_Region
 * @param {string} params.receivingTicket.SupplierDetails.Phone
 * @param {string} params.receivingTicket.SupplierDetails.Fax
 * @param {string} params.receivingTicket.SupplierDetails.Email
 * @param {string} params.receivingTicket.ExpectedDate
 * @param {string} [params.receivingTicket.Carrier]
 * @param {string} params.receivingTicket.TrackingNumbers
 * @param {string} params.receivingTicket.DriverName
 * @param {String} params.receivingTicket.LicensePlate
 * @param {String} params.receivingTicket.CustomerPO
 * @param {String} params.receivingTicket.AuthorizedNumber
 * @param {String} params.receivingTicket.Memo
 * @param {Object[]} params.receivingTicket.ShipmentTypelist
 * @param {string} params.receivingTicket.ShipmentTypelist.ShipmentTypelist
 * @param {string} params.receivingTicket.ShipmentTypelist[].SKU
 * @param {string} params.receivingTicket.ShipmentTypelist[].Style
 * @param {string} params.receivingTicket.ShipmentTypelist[].Color
 * @param {string} params.receivingTicket.ShipmentTypelist[].UPC
 * @param {string} params.receivingTicket.ShipmentTypelist[].Size
 * @param {integer} params.receivingTicket.ShipmentTypelist[].ExpectedQuantity
 * @param {integer} params.receivingTicket.ShipmentTypelist[].ActualQuantity
 * @param {integer} params.receivingTicket.ShipmentTypelist[].DamagedQuantity
 * @param {double} params.receivingTicket.ShipmentTypelist[].UnitCost
 * @param {string} params.receivingTicket.ShipmentTypelist[].ProductDescription
 * @param {double} params.receivingTicket.ShipmentTypelist[].ProductMSRP
 * @param {string} params.receivingTicket.ShipmentTypelist[].Comments
 * @param {string} params.receivingTicket.ShipmentTypelist[].ShipmentType
 * @param {string} params.receivingTicket.ShipmentTypelist[].ReturnReasonCode
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.receivingTicketAdd = function(params){

    let self = this;

    return new Promise(function (resolve, reject) {

        self.buildRequest(false, params).then(function(request){

            request.client.ReceivingTicketAdd(request.body, function(err, result ){


                if(err != null){

                    return reject(err);

                } else {

                    return resolve(result);
                }



            });

        }).catch(function(err){

            return reject(err);

        });

    });



};

/**
 *
 * @param {object} params
 * @param {string} params.receivingTicketId
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getReceivingTicketAddStatus = function(params){

    let self = this;

    return new Promise(function (resolve, reject) {

        self.buildRequest(true, params).then(function(request){

            request.client.GetReceivingTicketAddStatus(request.body, function(err, result ){


                if( err != null ){

                    return reject(err);

                } else {

                    return resolve(result);
                }

            });

        }).catch(function(err){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {object} params.PickTicket
 * @param {string} params.PickTicket.PickTicketNumber
 * @param {string} params.PickTicket.WareHouse
 * @param {string} params.PickTicket.OrderDate
 * @param {string} params.PickTicket.StartDate
 * @param {string} params.PickTicket.CancelDate
 * @param {string} params.PickTicket.ShipDate
 * @param {string} params.PickTicket.PaymentTerms
 * @param {string} params.PickTicket.CODAmount
 * @param {string} params.PickTicket.CertifiedFunds
 * @param {string} params.PickTicket.DepartmentDescription
 * @param {string} params.PickTicket.Store
 * @param {string} params.PickTicket.ShipVia
 * @param {string} params.PickTicket.ShipViaAccountNumber
 * @param {string} params.PickTicket.DVPercentage
 * @param {string} params.PickTicket.BillingOption
 * @param {string} params.PickTicket.ShipService
 * @param {string} params.PickTicket.SpecialInstructions
 * @param {string} params.PickTicket.CustomerPONumber
 * @param {string} params.PickTicket.AuthorizationNumber
 * @param {string} params.PickTicket.OrderNumber
 * @param {string} params.PickTicket.TakenBy
 * @param {string} params.PickTicket.DISTRIBUTIONCENTER
 * @param {string} params.PickTicket.DivisionCode
 * @param {string} params.PickTicket.DivisionDescription
 * @param {string} params.PickTicket.Department
 * @param {string} params.PickTicket.TRADINGPARTNER
 * @param {string} params.PickTicket.UseAccountUPS
 * @param {string} params.PickTicket.BillToCode
 * @param {object} params.PickTicket.BillToAddress
 * @param {string} params.PickTicket.BillToAddress.FirstName
 * @param {string} params.PickTicket.BillToAddress.LastName
 * @param {string} params.PickTicket.BillToAddress.CompanyName
 * @param {string} params.PickTicket.BillToAddress.Address1
 * @param {string} params.PickTicket.BillToAddress.Address2
 * @param {string} params.PickTicket.BillToAddress.City
 * @param {string} params.PickTicket.BillToAddress.State
 * @param {string} params.PickTicket.BillToAddress.Zip
 * @param {string} params.PickTicket.BillToAddress.Country
 * @param {string} params.PickTicket.BillToAddress.Non_US_Region
 * @param {string} params.PickTicket.BillToAddress.Phone
 * @param {string} params.PickTicket.BillToAddress.Email
 * @param {string} params.PickTicket.ShipToCode
 * @param {object} params.PickTicket.ShipToAddress
 * @param {string} params.PickTicket.ShipToAddress.FirstName
 * @param {string} params.PickTicket.ShipToAddress.LastName
 * @param {string} params.PickTicket.ShipToAddress.CompanyName
 * @param {string} params.PickTicket.ShipToAddress.Address1
 * @param {string} params.PickTicket.ShipToAddress.Address2
 * @param {string} params.PickTicket.ShipToAddress.City
 * @param {string} params.PickTicket.ShipToAddress.State
 * @param {string} params.PickTicket.ShipToAddress.Zip
 * @param {string} params.PickTicket.ShipToAddress.Country
 * @param {string} params.PickTicket.ShipToAddress.Non_US_Region
 * @param {string} params.PickTicket.ShipToAddress.Phone
 * @param {string} params.PickTicket.ShipToAddress.Email
 * @param {string} params.PickTicket.MarkForCode
 * @param {Array} params.PickTicket.LineItem
 * @param {string} params.PickTicket.
 * @param {object} params.PickTicket.MarkForAddress
 * @param {string} params.PickTicket.MarkForAddress.FirstName
 * @param {string} params.PickTicket.MarkForAddress.LastName
 * @param {string} params.PickTicket.MarkForAddress.CompanyName
 * @param {string} params.PickTicket.MarkForAddress.Address1
 * @param {string} params.PickTicket.MarkForAddress.Address2
 * @param {string} params.PickTicket.MarkForAddress.City
 * @param {string} params.PickTicket.MarkForAddress.State
 * @param {string} params.PickTicket.MarkForAddress.Country
 * @param {string} params.PickTicket.MarkForAddress.Non_US_Region
 * @param {string} params.PickTicket.MarkForAddress.Phone
 * @param {string} params.PickTicket.MarkForAddress.Email
 * @param {array} params.PickTicket.LineItem[]
 * @param {string} params.PickTicket.LineItem[].Season
 * @param {string} params.PickTicket.LineItem[].Style
 * @param {string} params.PickTicket.LineItem[].Description
 * @param {string} params.PickTicket.LineItem[].Color
 * @param {string} params.PickTicket.LineItem[].Size
 * @param {string} params.PickTicket.LineItem[].UPC
 * @param {string} params.PickTicket.LineItem[].UnitPrice
 * @param {string} params.PickTicket.LineItem[].Quantity
 * @param {string} params.PickTicket.LineItem[].Comments
 * @param {string} params.PickTicket.PriorityCode
 * @param {string} params.PickTicket.OrderType
 * @param {string} params.PickTicket.GiftMessage
 * @param {string} params.PickTicket.VatNumber
 * @param {string} params.PickTicket.DutiesPayer
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.pickTicketAdd = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.PickTicketAdd(request.body, function( err, result ){

                if( err != null ){

                    return reject(err);

                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 *
 * @param {object} params
 * @param {string} params.pickTicketNumber
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getPickTicketAddStatus = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(true, params).then(function( request ){

            request.client.GetPickTicketAddStatus( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};
/**
 *
 * @param {object} params
 * @param {string} params.PickTicketId
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.cancelPickTicket = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.CancelPickTicket(request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};
/**
 *
 * @param {object} params
 * @param {string} params.ptbarcode
 *
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.getPickTicketObjectByBarCode = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetPickTicketObjectByBarCode( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });


};

/**
 *
 *
 * @param {object} params
 * @param {string} params.orderNumber
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getPickTicketsByOrderNumber = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(true, params).then(function( request ){

            request.client.GetPickTicketsByOrderNumber( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.PickTicketStatus
 * @param {string} params.StartDate -- format mm/dd/yyyy
 * @param {string} params.EndDate -- format mm/dd/yyyy
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getPickTicketsByStatusAndCreateDate = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetPickTickesByStatusAndCreateDate( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.ptbarcode
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getPickTicketObjectItemsInBoxes = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetPickTicketObjectItemsInBoxes( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

/**
 *
 * @param {object} params
 * @param {string} params.StartDate -- format mm/dd/yyyy
 * @param {string} params.EndData -- format mmd/dd/yyyy
 *
 * @returns {Promise}
 */
BergenV3Api.prototype.getPickTicketStatusesByDate = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetPickTicketStatusesByDate( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};


/**
 *
 * @param {object} params
 * @param {array}  params.products
 * @param {object} params.products[].StyleMasterProduct
 * @param {string} params.products[].StyleMasterProduct.Sku
 * @param {string} params.products[].StyleMasterProduct.Style
 * @param {string} params.products[].StyleMasterProduct.Description
 * @param {string} params.products[].StyleMasterProduct.Color
 * @param {string} params.products[].StyleMasterProduct.Size
 * @param {string} params.products[].StyleMasterProduct.UPC
 * @param {Double} params.products[].StyleMasterProduct.Price
 * @param {string} params.products[].StyleMasterProduct.CountryOfOrigin
 * @param {string} params.products[].StyleMasterProduct.CustomsDescription
 * @param {string} params.products[].StyleMasterProduct.HarmonizedCode
 *
 * @returns {Promise}
 *
 */
BergenV3Api.prototype.styleMasterProductAdd = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.StyleMasterProductAdd( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};


/**
 *
 *
 * @param {object} params
 *
 * @returns {Promise}
 *
 *
 */
BergenV3Api.prototype.getStyleMasterProductAddStatus = function(params){

    let self = this;

    return new Promise(function( resolve, reject ){


        self.buildRequest(false, params).then(function( request ){

            request.client.GetStyleMasterProductAddStatus( request.body, function( err, result ){

                if( err != null ){

                    return reject(err);
                }

                return resolve(result);

            });


        }).catch(function( err ){

            return reject(err);

        });

    });

};

module.exports = BergenV3Api;
