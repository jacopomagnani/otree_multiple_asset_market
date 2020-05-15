from otree.api import (
    models, BaseConstants
)
from otree_markets import models as markets_models
from .configmanager import ConfigManager

class Constants(BaseConstants):
    name_in_url = 'otree_multiple_asset_market'
    players_per_group = None
    num_rounds = 99 

    # list of capital letters A..Z
    asset_names = [chr(i) for i in range(65, 91)]

    # the columns of the config CSV and their types
    # this dict is used by ConfigManager
    config_fields = {
        'period_length': int,
        'num_assets': int,
        'asset_endowments': str,
        'cash_endowment': int,
        'allow_short': bool,
    }


class Subsession(markets_models.Subsession):

    def asset_names(self):
        return Constants.asset_names[:self.config.num_assets]

    @property
    def config(self):
        config_addr = Constants.name_in_url + '/configs/' + self.session.config['config_file']
        return ConfigManager(config_addr, self.round_number, Constants.config_fields)
    
    def allow_short(self):
        return self.config.allow_short

    def creating_session(self):
        if self.round_number > self.config.num_rounds:
            return
        return super().creating_session()


class Group(markets_models.Group):
    pass


class Player(markets_models.Player):

    def asset_endowment(self):
        asset_names = self.subsession.asset_names()
        endowments = [int(e) for e in self.subsession.config.asset_endowments.split(' ') if e]
        assert len(asset_names) == len(endowments), 'invalid config. num_assets and asset_endowments must match'
        return dict(zip(asset_names, endowments))
    
    def cash_endowment(self):
        return self.subsession.config.cash_endowment
