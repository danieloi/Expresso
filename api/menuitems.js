const express = require('express');
const menuItemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database( process.env.TEST_DATABASE || './database.sqlite' );

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: menuItemId};
    db.get(sql, values, (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        next();
      } else {
        res.sendStatus(404);
      }
    });
  });

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.menu.id}`, (err, menu_items) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menu_items});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem;
    const menu_Id = req.menu.id;
    if ( !name || !description || !inventory || !price ) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) ' +
    'VALUES ($name, $description, $inventory, $price, $menu_id)';

    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menu_id: menu_Id
    };

    db.run(sql, values, function(error)  {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (error, menuItem) => {
                res.status(201).json({ menuItem: menuItem });
            });
        }
    });
   
});


menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const { name, description, inventory, price } = req.body.menuItem;

    if ( !name || !description || !inventory || !price ) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem  SET name = $name, description = $description, inventory = $inventory, price = $price ' +
    'WHERE MenuItem.id = $menuItemId';

    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (error, menuItem) => {
                res.status(200).json({ menuItem: menuItem});
            });
        }
    });

    menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
        const sql = `DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`;

        db.run(sql, (error) => {
            if (error) {
                next(error);
            } else {
                res.sendStatus(204);
            }
        });
    });
    
});

module.exports = menuItemsRouter;