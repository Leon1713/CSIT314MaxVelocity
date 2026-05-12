from Entity.Favorite import Favorite

class FavoriteController:
    def __init__(self):
        pass

    def getFavorites(self, donee_id: int):
        return Favorite.getByDoneeId(donee_id)

    def addFavorite(self, donee_id: int, fra_id: int):
        return Favorite.create(donee_id, fra_id)

    def removeFavorite(self, donee_id: int, fra_id: int):
        return Favorite.delete(donee_id, fra_id)