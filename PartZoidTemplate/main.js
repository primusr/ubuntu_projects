/* Call Initialize() Function to tell PartZoid Utility what you need */
window.onload = () => 
{
    var init_data = {
        cpu: true,              // should cpu data be retrieved?
        gpu: true,              // should gpu data be retrieved?
        ram: true,              // should ram data be retrieved?
        storage: true,          // should storage data be retrieved?
        network: true,          // should network data be retrieved?
        motherboard: true,      // should motherboard data be retrieved?
        frame: true,            // should frame data be retrieved?
        audio: true,            // should audio data be retrieved?

        rapid_interval: 120,    // how often (in milisecond) shoud the OnRapidUpdate function be called
    }
    
    Initialize(init_data);
};

/* OnStart() only be called ONCE at the beginning by PartZoid Utility */
var StartData;
function OnStart(json) 
{
    // date and time
    setInterval(() => {
        var date = new Date();
        SetText(system_date, `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}`);
        SetText(system_time, `${date.toLocaleTimeString('default', { timeStyle: "short"})}`);
    }, 3000);

    // cpu
    SetText(cpu_name, json.cpu.manufacturer + " " + json.cpu.family + " " + json.cpu.model);

    // gpu
    SetText(gpu_name, json.gpu.manufacturer + " " + json.gpu.family + " " + json.gpu.model);

    // ram
    SetText(ram_name, json.ram.type + "-" + json.ram.speed);

    // storage
    SetText(storage_name, json.storage.capacity + " TB");

    // motherboard
    SetText(motherboard_name, json.motherboard.model);

    //
    StartData = json;
}


/* OnFixedUpdate() will be called once per second */
var frame_last;
function OnFixedUpdate(json) 
{
    // cpu
    SetChart(cpu_temperature_chart, [temp = Math.max(json.cpu.temperature - 20.0, 0) / 80.0 * 100.0, 100 - temp]);
    SetText(cpu_temperature_value, json.cpu.temperature);
    SetChart(cpu_load_chart, [json.cpu.load]);
    SetText(cpu_load_value, json.cpu.load + "%");
    SetChart(cpu_clock_chart, [json.cpu.clock / 5.0 * 100.0]);
    SetText(cpu_clock_value, json.cpu.clock + " GHz");
    SetChart(cpu_tdp_chart, [json.cpu.power / 200.0 * 100.0]);
    SetText(cpu_tdp_value, json.cpu.power + " Watts");

    // gpu
    SetChart(gpu_temperature_chart, [temp = Math.max(json.gpu.temperature - 20.0, 0) / 80.0 * 100.0, 100 - temp]);
    SetText(gpu_temperature_value, json.gpu.temperature);
    SetChart(gpu_load_chart, [json.gpu.load]);
    SetText(gpu_load_value, json.gpu.load + "%");
    SetChart(gpu_vram_chart, [json.gpu.vram_used / StartData.gpu.vram_total * 100.0]);
    SetText(gpu_vram_value, json.gpu.vram_used + " GB");
    SetChart(gpu_tdp_chart, [json.gpu.power / 400.0 * 100.0]);
    SetText(gpu_tdp_value, json.gpu.power + " Watts");

    // ram
    SetChart(ram_load_chart, [json.ram.used / StartData.ram.capacity * 100.0]);
    SetText(ram_used_value, json.ram.used + " GB");

    // storage
    SetChartLive2(storage_load_chart, json.storage.read_speed / 102.4 / 1024.0, json.storage.write_speed / 102.4 / 1024.0, 20);

    // network
    SetText(network_name, json.network.count + " Connections");
    SetChart(network_load_chart, [json.network.load]);
    SetText(network_download_value, NetworkUnit(json.network.download_speed));
    SetText(network_upload_value, NetworkUnit(json.network.upload_speed));
    function NetworkUnit(kb) { return kb < 50000 ? (kb / 102.4).toFixed(1) + " KB/s" : kb < 50000000 ? (kb / 1024.0 / 102.4).toFixed(1) + " MB/s" : (kb / 1024.0 / 1024.0 / 102.4).toFixed(1) + " GB/s"}

    // motherboard
    json.motherboard.fans = json.motherboard.fans.filter(f => f.rpm != 0);
    motherboard_fan_load_chart.data.labels.length = json.motherboard.fans.length;
    SetChart(motherboard_fan_load_chart, json.motherboard.fans.map(m => m.load));
    
    // frame
    SetText(frame_name, frame_last = json.frame.name);
    if (frame_last != json.frame.name) frame_timestamp_chart.data.datasets[0].data = [];        // Clear frame chart when frame name changed
    SetChartLive(frame_timestamp_chart, json.frame.timedeltas, 256);
    SetText(frame_fps_value, Math.round(json.frame.framerate) + " FPS");

    // audio
    SetText(audio_name, json.audio.name);
}


/* OnRapidUpdate() call interval is set when Initalize() is called */
function OnRapidUpdate(json) 
{
    // audio
    SetChart(spectrum_chart, json.audio.spectrum);
    SetChart(audio_volume_chart, [json.audio.volume]);
}





/* HELPERS */
function SetText(text_ele, value) { text_ele.textContent = value; }
function SetChart(chart, data) { 
    chart.data.datasets[0].data = data;
    chart.update();
}
function SetChartLive(chart, data, limit) {
    chart.data.datasets[0].data.push(...data);
    if (chart.data.datasets[0].data.length > limit) chart.data.datasets[0].data.splice(0, chart.data.datasets[0].data.length - limit);
    chart.update();
}
function SetChartLive2(chart, data1, data2, limit) {
    chart.data.datasets[0].data.push(data1);
    chart.data.datasets[1].data.push(data2);
    if (chart.data.datasets[0].data.length > limit) chart.data.datasets[0].data.shift();
    if (chart.data.datasets[1].data.length > limit) chart.data.datasets[1].data.shift();
    chart.update();
}