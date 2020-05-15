import { html, PolymerElement } from '/static/otree-redwood/node_modules/@polymer/polymer/polymer-element.js';
import '/static/otree-redwood/node_modules/@polymer/polymer/lib/elements/dom-repeat.js';
import '/static/otree-redwood/src/redwood-period/redwood-period.js';

import '/static/otree_markets/trader_state.js'

import '/static/otree_markets/simple_modal.js';
import '/static/otree_markets/event_log.js';

import './asset_cell.js'
import './asset_table.js'

/*
    this component is the main entry point for the text interface frontend. it maintains the market state in
    the `bids`, `asks` and `trades` array properties and coordinates communication with the backend
*/

class MultipleAssetTextInterface extends PolymerElement {

    static get properties() {
        return {
            timeRemaining: Number,
            bids: Array,
            asks: Array,
            trades: Array,
            settledAssetsDict: Object,
            availableAssetsDict: Object,
            settledCash: Number,
            availableCash: Number,
            assetNames: {
                type: Array,
                computed: '_compute_asset_names(availableAssetsDict)',
            }
        };
    }

    static get template() {
        return html`
            <style>
                * {
                    box-sizing: border-box;
                }
                .full-width {
                    width: 100vw;
                    margin-left: 50%;
                    transform: translateX(-50%);
                }

                .main-container {
                    width: 100%;
                    margin-top: 20px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-evenly;
                }
                .main-container > div {
                    flex: 0 0 48%;
                    margin-bottom: 20px;
                    height: 30vh;
                }

                .info-container {
                    width: 100%;
                    height: 30vh;
                    display: flex;
                    padding: 0 5px 0 5px;
                }
                .info-container > div {
                    flex: 1;
                    margin: 0 5px 0 5px;
                }
            </style>

            <simple-modal
                id="modal"
            ></simple-modal>
            <trader-state
                id="trader_state"
                bids="{{bids}}"
                asks="{{asks}}"
                trades="{{trades}}"
                settled-assets-dict="{{settledAssetsDict}}"
                available-assets-dict="{{availableAssetsDict}}"
                settled-cash="{{settledCash}}"
                available-cash="{{availableCash}}"
                time-remaining="{{timeRemaining}}"
                on-confirm-trade="_confirm_trade"
                on-confirm-cancel="_confirm_cancel"
                on-error="_handle_error"
            ></trader-state>

            <div class="full-width">
                <div class="main-container">
                    <template is="dom-repeat" items="{{assetNames}}">
                        <div>
                            <asset-cell
                                asset-name="[[item]]"
                                bids="[[bids]]"
                                asks="[[asks]]"
                                trades="[[trades]]"
                                on-order-entered="_order_entered"
                                on-order-canceled="_order_canceled"
                                on-order-accepted="_order_accepted"
                            ></asset-cell>
                        </div>
                    </template>
                </div>
                <div class="info-container">
                    <div>
                        <asset-table
                            time-remaining="[[timeRemaining]]"
                            settled-assets-dict="[[settledAssetsDict]]"
                            available-assets-dict="[[availableAssetsDict]]"
                            settled-cash="[[settledCash]]"
                            available-cash="[[availableCash]]"
                            bids="[[bids]]"
                            asks="[[asks]]"
                        ></asset-table>
                    </div>
                    <div>
                        <event-log
                            id="log"
                            max-entries=100
                        ></event-log>
                    </div>
                </div>
            </div>
        `;
    }

    _compute_asset_names(availableAssetsDict) {
        return Object.keys(availableAssetsDict);
    }

    // triggered when this player enters an order
    // sends an order enter message to the backend
    _order_entered(event) {
        const order = event.detail;
        if (isNaN(order.price)) {
            this.$.log.error('Invalid order entered');
            return;
        }
        this.$.trader_state.enter_order(order.price, 1, order.is_bid, order.asset_name);
    }

    // triggered when this player cancels an order
    // sends an order cancel message to the backend
    _order_canceled(event) {
        const order = event.detail;

        this.$.modal.modal_text = 'Are you sure you want to remove this order?';
        this.$.modal.on_close_callback = (accepted) => {
            if (!accepted)
                return;

            this.$.trader_state.cancel_order(order)
        };
        this.$.modal.show();
    }

    _order_accepted(event) {
        const order = event.detail;
        if (order.pcode == this.pcode)
            return;

        this.$.modal.modal_text = `Do you want to ${order.is_bid ? 'buy' : 'sell'} asset ${order.asset_name} for $${order.price}?`
        this.$.modal.on_close_callback = (accepted) => {
            if (!accepted)
                return;

            this.$.trader_state.accept_order(order);
        };
        this.$.modal.show();
    }

    // react to the backend confirming that a trade occurred
    _confirm_trade(event) {
        const trade = event.detail;
        // since we're doing unit volume, there can only ever be one making order
        const all_orders = [trade.making_orders[0], trade.taking_order];
        for (let order of all_orders) {
            if (order.pcode == this.pcode)
                this.$.log.info(`You ${order.is_bid ? 'bought' : 'sold'} asset ${order.asset_name} for $${trade.making_orders[0].price}`);
        }
    }

    // react to the backend confirming that an order was canceled
    _confirm_cancel(event) {
        const order = event.detail;
        if (order.pcode == this.pcode) {
            this.$.log.info(`You canceled your ${msg.is_bid ? 'bid' : 'ask'}`);
        }
    }

    // handle an error sent from the backend
    _handle_error(event) {
        const message = event.detail;
        this.$.log.error(message);
    }
}

window.customElements.define('multiple-asset-text-interface', MultipleAssetTextInterface);
