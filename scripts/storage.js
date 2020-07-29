function strMapToObj(strMap) {
    let obj = Object.create(null)
    for (let [k, v] of strMap) {
        obj[k] = v
    }
    return obj
}

function objToStrMap(obj) {
    let strMap = new Map()
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k])
    }
    return strMap
}

function strMapToJson(strMap) {
    return JSON.stringify(strMapToObj(strMap))
}

function jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr))
}

class Storage {
    storage = null
    local_path = "assets/StrongPassword.txt"

    constructor() {
        this.storage = new Map()
        if ($file.exists(this.local_path)) {
            this.load_from_local()
        }
    }

    load_from_local() {
        this.storage = jsonToStrMap($file.read(this.local_path))
    }

    update_local_data() {
        let str = strMapToJson(this.storage)
        console.log(str)
        return $file.write({
            data: $data({ string: str }),
            path: this.local_path
        })
    }

    search() {

    }

    save(name, password) {
        this.storage.set(name, password)
        return this.update_local_data()
    }

    delete(name) {
        this.storage.delete(name)
        console.log(this.keys())
    }

    has(name) {
        return this.storage.has(name)
    }

    keys() {
        let keys = []
        for (let name of this.storage) {
            keys.push(name[0])
        }
        return keys
    }

    all() {
        function get_label(name, password) {
            return {
                list_password: {
                    text: password.password
                },
                list_name: {
                    text: name
                },
                list_date: {
                    text: password.date
                },
            }
        }
        let all = []
        for (let [name, password] of this.storage) {
            all.push(get_label(name, password))
        }
        return all
    }
}

module.exports = {
    Storage: Storage
}