from Entity.Account import Account

class ReadUserAccountController:
    def __init__(self):
        pass

    def getUserAccount(self, account_id):
            acc : Account = Account.getUsersById(account_id)
            return acc