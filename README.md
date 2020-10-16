# otree_multiple_asset_market

This experiment is a multiple-asset CDA market implemented using [oTree Markets](https://github.com/Leeps-Lab/otree_markets). To install, follow the installation instructions for oTree Markets [here](https://github.com/Leeps-Lab/otree_markets/wiki/Installation). Then clone this repo into your oTree project folder and add the following session config dict to `SESSION_CONFIGS` in settings.py:

```python
dict(
   name='otree_multiple_asset_market',
   display_name='Multiple Asset Market',
   num_demo_participants=2,
   app_sequence=['otree_multiple_asset_market'],
   config_file='demo.csv',
),
```

Config files are located in the "configs" directory. They're CSVs where each row configures a round of trading. The columns are described below.

* `period_length` - the length of the round in seconds
* `num_assets` - the number of assets. assets are automatically named 'A', 'B', 'C' etc.
* `asset_endowments` - a space-separated list of numbers determining the amount of each asset each player is endowed with
    * for example, if `num_assets` is 3, an `asset_endowments` value of `"10 10 5"` means players get 10 of asset A, 10 of asset B and 5 of asset C.
* `cash_endowment` - the amount of cash each player is endowed with
* `allow_short` - either "true" or "false". if true, players are allowed to have negative cash and asset holdings
