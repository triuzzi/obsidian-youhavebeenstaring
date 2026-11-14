'use strict';

const { moment, Notice, Plugin, PluginSettingTab, Setting } = require('obsidian');

const DEFAULT_SETTINGS = {
    totalUptime: 0,
    lastLoad: Date.now(),
    currentSessionDuration: 0,
    showTotalUptimeInStatusBar: false,
    displayStaringTimeAsHumanString: true,
    staringText: 'You have been staring at your vault for ',
    totalStaringText: 'Your total staring time in this vault is ',
    pausedText: 'Your staring counter is paused'
};

class YouHaveBeenStaring extends Plugin {
    async onload() {
        await this.loadSettings();
        this.settings.lastLoad = Date.now();
        this.settings.currentSessionDuration = 0;
        this.counterActive = true;

        this.staringTimeStatusBar = this.addStatusBarItem();
        this.totalStaringTimeStatusBar = this.addStatusBarItem();

        this.registerInterval(window.setInterval(() => {
            this.showTimeSinceLoad();
            this.showTotalStaringTime();
            if (this.counterActive) {
                this.settings.totalUptime += 1000;
                this.settings.currentSessionDuration += 1000;
            }
        }, 1000));

        // Save every 10 minutes
        this.registerInterval(window.setInterval(() => {
            this.saveSettings();
        }, 600000));

        this.addSettingTab(new YouHaveBeenStaringSettingsTab(this.app, this));

        this.addRibbonIcon('eye', 'Start/stop staring counter', () => {
            this.counterActive = !this.counterActive;
            new Notice('Turning staring counter ' + (this.counterActive ? 'on' : 'off'));
            this.saveSettings();
        });
    }

    onunload() {
        this.saveSettings();
    }

    showTimeSinceLoad() {
        if (this.settings.lastLoad && this.counterActive) {
            const staringTime = moment.duration(this.settings.currentSessionDuration, 'milliseconds').humanize();
            this.staringTimeStatusBar.setText(this.settings.staringText + `${staringTime}`);
        }

        if (!this.counterActive) {
            this.staringTimeStatusBar.setText(this.settings.pausedText);
        }
    }

    showTotalStaringTime() {
        if (this.settings.showTotalUptimeInStatusBar && this.settings.totalUptime > 0) {
            const totalStaringTime = this.settings.displayStaringTimeAsHumanString
                ? moment.duration(this.settings.totalUptime, 'milliseconds').humanize()
                : moment.duration(this.settings.totalUptime, 'milliseconds').hours() + ':' + moment.duration(this.settings.totalUptime, 'milliseconds').minutes();
            this.totalStaringTimeStatusBar.setText(this.settings.totalStaringText + `${totalStaringTime}`);
        }
    }

    async loadSettings() {
        this.settings = Object.assign(DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class YouHaveBeenStaringSettingsTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h3', { text: 'YouHaveBeenStaring settings' });

        new Setting(containerEl)
            .setName('Show total staring duration')
            .setDesc('Displays the total duration you have been staring on your vault (well at least when this plugin was able to measure it).')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showTotalUptimeInStatusBar)
                    .onChange((value) => {
                        this.plugin.settings.showTotalUptimeInStatusBar = value;
                        if (!value) {
                            this.plugin.totalStaringTimeStatusBar.empty();
                        }
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Display total recorded staring time as human readable')
            .setDesc('The recorded staring time is shown as text, such as \'10 hours\'. Turning this off will show the total recorded time in HH:mm fashion.')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.displayStaringTimeAsHumanString)
                    .onChange((value) => {
                        this.plugin.settings.displayStaringTimeAsHumanString = value;
                        this.plugin.showTotalStaringTime();
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Status bar text of staring time')
            .setDesc('Overrides the status bar text displaying your staring time.')
            .addTextArea((text) =>
                text
                    .setValue(this.plugin.settings.staringText)
                    .setPlaceholder('You have been staring at your vault for ')
                    .onChange((value) => {
                        this.plugin.settings.staringText = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Status bar text of total staring time')
            .setDesc('Overrides the status bar text displaying your total staring time for this vault.')
            .addTextArea((text) =>
                text
                    .setValue(this.plugin.settings.totalStaringText)
                    .setPlaceholder('Your total staring time in this vault is ')
                    .onChange((value) => {
                        this.plugin.settings.totalStaringText = value;
                        this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Status bar text when staring counter is paused')
            .setDesc('Overrides the status bar text shown when you disabled the staring time counting.')
            .addTextArea((text) =>
                text
                    .setValue(this.plugin.settings.pausedText)
                    .setPlaceholder('Your staring counter is paused')
                    .onChange((value) => {
                        this.plugin.settings.pausedText = value;
                        this.plugin.saveSettings();
                    })
            );
    }
}

module.exports = YouHaveBeenStaring;
