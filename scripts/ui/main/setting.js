const BaseUISetting = require("/scripts/ui/components/base-ui-setting")

class SettingUI extends BaseUISetting {
    constructor(kernel, factory) {
        super(kernel, factory)
    }

    readme() {
        const content = $file.read("/README.md").string
        this.factory.push([{
            type: "markdown",
            props: {
                content: content,
            },
            layout: (make, view) => {
                make.size.equalTo(view.super)
            }
        }])
    }

    backup_to_iCloud() {
        const backup_action = () => {
            if (this.kernel.storage.backup_to_iCloud()) {
                $ui.alert($l10n('BACKUP_SUCCESS'))
            } else {
                $ui.alert($l10n('BACKUP_ERROR'))
            }
        }
        if (this.kernel.storage.has_backup()) {
            $ui.alert({
                title: $l10n("BACKUP"),
                message: $l10n("ALREADY_HAS_BACKUP"),
                actions: [
                    {
                        title: $l10n("OK"),
                        handler: () => {
                            backup_action()
                        }
                    },
                    { title: $l10n("CANCEL") }
                ]
            })
        } else {
            backup_action()
        }
    }

    recover_from_iCloud() {
        $drive.open({
            handler: data => {
                if (this.kernel.storage.recover_from_iCloud(data)) {
                    // 更新列表
                    let storage = require("./storage")
                    storage.set_data(this.kernel.storage.all())
                    // 弹窗提示
                    $ui.alert({
                        title: $l10n("RECOVER"),
                        message: $l10n("RECOVER_SUCCESS"),
                    })
                }
            }
        })
    }
}

module.exports = SettingUI