class Storage {
    constructor(setting) {
        this.setting = setting
        this.localDb = "/storage/StrongPassword.db"
        // TODO 兼容旧版本
        if ($file.exists("/assets/StrongPassword.db")) {
            $file.move({
                src: "/assets/StrongPassword.db",
                dst: this.localDb
            })
        }
        // end 兼容旧版本
        this.iCloudPath = "drive://StrongPassword/"
        this.iCloudDb = this.iCloudPath + "StrongPassword.db"
        this.iCloudAutoDb = this.iCloudPath + "auto.db"
        this.sqlite = $sqlite.open(this.localDb)
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
                id: result.result.get("id"),
                account: result.result.get("account"),
                password: result.result.get("password"),
                date: result.result.get("date"),
                website: JSON.parse(result.result.get("website"))
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
        return this.parse(result)
    }

    save(password) {
        let result
        password.website = password.website ? password.website : []
        result = this.sqlite.update({
            sql: "INSERT INTO password (account, password, date, website) values(?, ?, ?, ?)",
            args: [password.account, password.password, password.date, JSON.stringify(password.website)]
        })
        if (result.result) {
            if (this.setting.get("backup.autoBackup")) {
                if (!$file.exists(this.iCloudPath)) {
                    $file.mkdir(this.iCloudPath)
                }
                $file.write({
                    data: $data({ path: this.localDb }),
                    path: this.iCloudAutoDb
                })
            }
            return true
        }
        $console.error(result.error)
        return false
    }

    hasBackup() {
        return $file.exists(this.iCloudDb)
    }

    backupToICloud() {
        if (!$file.exists(this.iCloudPath)) {
            $file.mkdir(this.iCloudPath)
        }
        return $file.write({
            data: $data({ path: this.localDb }),
            path: this.iCloudDb
        })
    }

    recoverFromICloud(data) {
        let result = $file.write({
            data: data,
            path: this.localDb
        })
        if (result) {
            this.sqlite = $sqlite.open(this.localDb)
        }
        return result
    }

    update(password) {
        let result
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