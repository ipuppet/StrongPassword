class SettingUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
    }

    readme() {
        const content = $file.read("/README.md").string
        this.factory.push([{
            type: "markdown",
            props: { content: content },
            layout: (make, view) => {
                make.size.equalTo(view.super)
            }
        }])
    }

    backupToICloud() {
        this.start()
        const backupAction = () => {
            if (this.kernel.storage.backupToICloud()) {
                $ui.alert($l10n("BACKUP_SUCCESS"))
                this.done()
            } else {
                $ui.alert($l10n("BACKUP_ERROR"))
                this.cancel()
            }
        }
        if (this.kernel.storage.hasBackup()) {
            $ui.alert({
                title: $l10n("BACKUP"),
                message: $l10n("ALREADY_HAS_BACKUP"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            backupAction()
                        }
                    },
                    {
                        title: $l10n("CANCEL"),
                        handler: () => { this.cancel() }
                    }
                ]
            })
        } else {
            backupAction()
        }
    }

    recoverFromICloud() {
        this.start()
        $drive.open({
            handler: data => {
                if (this.kernel.storage.recoverFromICloud(data)) {
                    // 更新列表
                    let storage = require("./storage")
                    storage.setData(this.kernel.storage.all())
                    this.done()
                } else {
                    this.cancel()
                }
            }
        })
    }
}

module.exports = SettingUI