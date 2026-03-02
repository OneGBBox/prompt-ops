import { Routes } from '@angular/router';
import { TokensComponent } from './tokens/tokens.component';
import { JsonSchemaComponent } from './json-schema/json-schema.component';
import { TemperatureComponent } from './temperature/temperature.component';
import { FewShotComponent } from './few-shot/few-shot.component';

export const routes: Routes = [
    { path: '', redirectTo: 'tokens', pathMatch: 'full' },
    { path: 'tokens', component: TokensComponent },
    { path: 'json-schema', component: JsonSchemaComponent },
    { path: 'temperature', component: TemperatureComponent },
    { path: 'few-shot', component: FewShotComponent },
];