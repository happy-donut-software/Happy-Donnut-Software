<?php

declare(strict_types=1);
namespace App\Console\Commands;
use App\Infraestructura\Persistencia\Modelos\EventoDominioModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Throwable;
class PublicarEventosOutbox extends Command {
    protected $signature = 'ventas:publicar-eventos {--continuo : Mantener el relay activo}';
    protected $description = 'Publica eventos de la outbox a Inventario y Finanzas con reintentos.';
    public function handle(): int {
        do {
            $procesados=$this->publicarLote();
            if(!$this->option('continuo')) { break; }
            if($procesados===0) { sleep(2); }
        } while(true);
        return self::SUCCESS;
    }
    private function publicarLote(): int {
        $eventos=EventoDominioModel::whereNull('publicado_en')->orderBy('ocurrido_en')->limit(50)->get();
        foreach($eventos as $evento) {
            try {
                $payload=array_merge($evento->payload,[
                    'evento_id'=>$evento->id, 'ocurrido_en'=>$evento->ocurrido_en->toIso8601String(),
                ]);
                $headers=['X-Eventos-Secret'=>(string)env('EVENTOS_SECRET'),'Accept'=>'application/json'];
                $inventario=Http::withHeaders($headers)->retry(3,500)->timeout(10)->post((string)env('INVENTARIO_EVENT_URL'),$payload);
                $finanzas=Http::withHeaders($headers)->retry(3,500)->timeout(10)->post((string)env('FINANZAS_EVENT_URL'),$payload);
                if(!$inventario->successful() || !$finanzas->successful()) { throw new \RuntimeException('Consumidor rechazo el evento.'); }
                $evento->update(['publicado_en'=>now(),'intentos'=>$evento->intentos+1]);
            } catch(Throwable $error) {
                $evento->increment('intentos');
                report($error);
            }
        }
        return $eventos->count();
    }
}