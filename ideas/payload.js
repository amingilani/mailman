/**
    Convert bitcoin for paper money.

    Given:
    - Atleast two goods exist
    - Multiple markets exist
    - Each market has its own price
    - Each market may impose it's own quotas

    Achieve:
    - An actor that aids in the optimal trading between the assets

    Build:
    - A system to automatically convert one asset for the other.
    - A system that can calculate the conversion prices for all exchanges.
    - Finds the optimal conversion prices for a given quantity of one good.

    So that it may:
    - Adapt to changes in markets instantly
    - Lock prices with bounds for risk
    - Charge a premium and add it to the cost

    It must be easy enough that it:
    - Issue an invoice
    - Initiate payment of funds
    - Issue a receipt


  **/
// a list of all the available orders.
var Orderbook = Array();

// how orders in the orderbook look like
var Orders = {
  supplyType: String(), // crypto or fiat
  supplyQuantity: Number(),
  demandType: String(), // crypto or fiat
  demandQuantity: Number(),
  time: Date(),
  exchange: String()
};

var Invoice = {
  // the invoice to be issued
  price: Number(),
  date : Date()
};

// Creating an invoice
function createInvoice(quantity, price, supplyType, demandType) {

  // filter to sort through orders
  function filterMatches (order) {
      if (order.supplyType === demandType && order.demandType === supplyType) {
        return true;
      }
    }

    function sortJsonArrayByProperty(objArray, prop, direction){
        if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
        var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending

        if (objArray && objArray.constructor===Array){
            var propPath = (prop.constructor===Array) ? prop : prop.split(".");
            objArray.sort(function(a,b){
                for (var p in propPath){
                    if (a[propPath[p]] && b[propPath[p]]){
                        a = a[propPath[p]];
                        b = b[propPath[p]];
                    }
                }
                // convert numeric strings to integers
                a = a.match(/^\d+$/) ? +a : a;
                b = b.match(/^\d+$/) ? +b : b;
                return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
            });
        }
    }

sortJsonArrayByProperty(Orders.filter(filterMatches), 'supplyQuantity', -1);

  // cumulative function
  for (var i=0, cDemandQuantity; cDemandQuantity>=quanitity; i++) {
    cDemandQuantity += Orderbook.demandQuanitity[i];
  }

  var invoice = new Invoice();
  return invoice;

}
