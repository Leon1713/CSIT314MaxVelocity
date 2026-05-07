from ..Entity.Account import Account

class UpdateUserAccountController:
    def __init__(self):
        pass
    def updateUserAccount(self, account_id, input_data) -> bool:
            try:
                acc : Account = Account.getUsersById(account_id)
                for key, value in input_data.items():
                    setattr(acc, key, value)
                if not acc.update():
                    return False
                return True
            except Exception as e:
                raise e
                