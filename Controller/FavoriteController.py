from db import get_db_connection
from Entity.Favorite import Favorite

class FavoriteController:
    def __init__(self):
        pass

    def getFavorites(self, donee_id: int):
        with get_db_connection() as conn:
            return Favorite.getByDoneeId(donee_id,conn)

    def addFavorite(self, donee_id: int, fra_id: int):
        with get_db_connection() as conn:
            return Favorite.create(donee_id, fra_id, conn)

    def removeFavorite(self, donee_id: int, fra_id: int):
        with get_db_connection() as conn:
            return Favorite.delete(donee_id, fra_id, conn)