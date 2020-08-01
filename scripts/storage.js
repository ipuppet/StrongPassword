/* function strMapToObj(strMap) {
    let obj = Object.create(null)
    for (let [k, v] of strMap) {
        obj[k] = v
    }
    return obj
} */

function objToStrMap(obj) {
    let strMap = new Map()
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k])
    }
    return strMap
}

/* function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap))
} */

function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr))
}

function to_new() {
    let path = "assets/StrongPassword.txt"
    let storage = new Storage()
    if ($file.exists(path)) {
        let file_content = $file.read(path).string
        if (file_content.substring(0, 3) !== "END") {
            let old_data = jsonToStrMap(file_content)
            for (let [account, password] of old_data) {
                password['account'] = account
                storage.save(password)
            }
            $file.write({
                data: $data({ string: "END\n" + file_content }),
                path: path
            })
            return
        }
    }
    let sqlite = $sqlite.open("assets/StrongPassword.db")
    let result = sqlite.query("SELECT * FROM password_storage")
    if (result !== null && result.result !== null) {
        let data = []
        while (result.result.next()) {
            data.push({
                account: result.result.get('name'),
                password: result.result.get('password'),
                date: result.result.get('date'),
                website: [],
            })
        }
        for (let item of data) {
            if (item.password !== '')
                storage.save(item)
        }
    }
    $ui.alert({
        title: $l10n("ALERT_INFO"),
        message: "没有数据需要迁移",
    })
}

class Storage {
    constructor() {
        this.sqlite = $sqlite.open("assets/StrongPassword.db")
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
            sql: "SELECT * FROM password where account like ? or website like ?",
            args: ["%" + kw + "%", "%" + kw + "%"]
        })
        let data = this.parse(result)
        return data
    }

    save(password) {
        let result = null
        result = this.sqlite.update({
            sql: "INSERT INTO password (account, password, date, website) values(?, ?, ?, ?)",
            args: [password.account, password.password, password.date, JSON.stringify(password.website)]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
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
            sql: "DELETE FROM password where id = ?",
            args: [id]
        })
        if (result.result) {
            return true
        }
        $console.error(result.error)
        return false
    }
}

module.exports = {
    Storage: Storage,
    to_new: to_new
}