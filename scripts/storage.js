class Storage {
    constructor(setting) {
        this.setting = setting
        this.local_db = "/assets/StrongPassword.db"
        this.icloud_path = "drive://StrongPassword/"
        this.icloud_db = this.icloud_path + "StrongPassword.db"
        this.icloud_auto_db = this.icloud_path + "auto.db"
        this.sqlite = $sqlite.open(this.local_db)
        this.sqlite.update("CREATE TABLE IF NOT EXISTS password(id INTEGER PRIMARY KEY NOT NULL, account TEXT, password TEXT, date TEXT, website TEXT)")
    }

    parse(result) {
        if (result.error !== null) {
            $console.error(result.error)
            return false
        }
        let data = []
        while (result.result.next()) {
            data.push({
                id: result.result.get('id'),
                account: result.result.get('account'),
                password: result.result.get('password'),
                date: result.result.get('date'),
                website: JSON.parse(result.result.get('website')),
            })
        }
        // result.result.close()
        return data
    }

    all() {
        let result = this.sqlite.query("SELECT * FROM password ORDER BY date DESC")
        return this.parse(result)
    }

    search(kw) {
        let result = this.sqlite.query({
            sql: "SELECT * FROM password WHERE account like ? or website like ?",
            args: [`%${kw}%`, `%${kw}%`]
        })
        let data = this.parse(result)
        return data
    }

    save(password) {
        let result = null
        password.website = password.website ? password.website : []
        result = this.sqlite.update({
            sql: "INSERT INTO password (account, password, date, website) values(?, ?, ?, ?)",
            args: [password.account, password.password, password.date, JSON.stringify(password.website)]
        })
        if (result.result) {
            if (this.setting.get("setting.backup.auto_backup")) {
                if (!$file.exists(this.icloud_path)) {
                    $file.mkdir(this.icloud_path)
                }
                $file.write({
                    data: $data({ path: this.local_db }),
                    path: this.icloud_auto_db
                })
            }
            return true
        }
        $console.error(result.error)
        return false
    }

    has_backup() {
        return $file.exists(this.icloud_db)
    }

    backup_to_iCloud() {
        if (!$file.exists(this.icloud_path)) {
            $file.mkdir(this.icloud_path)
        }
        return $file.write({
            data: $data({ path: this.local_db }),
            path: this.icloud_db
        })
    }

    recover_from_iCloud(data) {
        let result = $file.write({
            data: data,
            path: this.local_db
        })
        if (result) {
            this.sqlite = $sqlite.open(this.local_db)
        }
        return result
    }

    update(password) {
        let result = null
        result = this.sqlite.update({
            sql: "UPDATE password SET password = ?, date = ?, website = ?,account = ? WHERE id = ?",
            args: [password.password, password.date, JSON.stringify(password.website), password.account, password.id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }

    delete(id) {
        let result = this.sqlite.update({
            sql: "DELETE FROM password WHERE id = ?",
            args: [id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }
}

module.exports = Storage