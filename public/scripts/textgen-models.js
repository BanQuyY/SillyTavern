import { callPopup, getRequestHeaders, setGenerationParamsFromPreset } from '../script.js';
import { isMobile } from './RossAscends-mods.js';
import { textgenerationwebui_settings as textgen_settings, textgen_types } from './textgen-settings.js';
import { tokenizers } from './tokenizers.js';

let mancerModels = [];
let togetherModels = [];
let infermaticAIModels = [];
export let openRouterModels = [];

export async function loadOllamaModels(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid Ollama models data', data);
        return;
    }

    if (!data.find(x => x.id === textgen_settings.ollama_model)) {
        textgen_settings.ollama_model = data[0]?.id || '';
    }

    $('#ollama_model').empty();
    for (const model of data) {
        const option = document.createElement('option');
        option.value = model.id;
        option.text = model.name;
        option.selected = model.id === textgen_settings.ollama_model;
        $('#ollama_model').append(option);
    }
}

export async function loadTogetherAIModels(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid Together AI models data', data);
        return;
    }

    togetherModels = data;

    if (!data.find(x => x.name === textgen_settings.togetherai_model)) {
        textgen_settings.togetherai_model = data[0]?.name || '';
    }

    $('#model_togetherai_select').empty();
    for (const model of data) {
        // Hey buddy, I think you've got the wrong door.
        if (model.display_type === 'image') {
            continue;
        }

        const option = document.createElement('option');
        option.value = model.name;
        option.text = model.display_name;
        option.selected = model.name === textgen_settings.togetherai_model;
        $('#model_togetherai_select').append(option);
    }
}

export async function loadInfermaticAIModels(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid Infermatic AI models data', data);
        return;
    }

    infermaticAIModels = data;

    if (!data.find(x => x.id === textgen_settings.infermaticai_model)) {
        textgen_settings.infermaticai_model = data[0]?.id || '';
    }

    $('#model_infermaticai_select').empty();
    for (const model of data) {
        if (model.display_type === 'image') {
            continue;
        }

        const option = document.createElement('option');
        option.value = model.id;
        option.text = model.id;
        option.selected = model.id === textgen_settings.infermaticai_model;
        $('#model_infermaticai_select').append(option);
    }
}

export async function loadMancerModels(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid Mancer models data', data);
        return;
    }

    mancerModels = data;

    if (!data.find(x => x.id === textgen_settings.mancer_model)) {
        textgen_settings.mancer_model = data[0]?.id || '';
    }

    $('#mancer_model').empty();
    for (const model of data) {
        const option = document.createElement('option');
        option.value = model.id;
        option.text = model.name;
        option.selected = model.id === textgen_settings.mancer_model;
        $('#mancer_model').append(option);
    }
}

export async function loadOpenRouterModels(data) {
    if (!Array.isArray(data)) {
        console.error('Invalid OpenRouter models data', data);
        return;
    }

    openRouterModels = data;

    if (!data.find(x => x.id === textgen_settings.openrouter_model)) {
        textgen_settings.openrouter_model = data[0]?.id || '';
    }

    $('#openrouter_model').empty();
    for (const model of data) {
        const option = document.createElement('option');
        option.value = model.id;
        option.text = model.id;
        option.selected = model.id === textgen_settings.openrouter_model;
        $('#openrouter_model').append(option);
    }
}

function onMancerModelSelect() {
    const modelId = String($('#mancer_model').val());
    textgen_settings.mancer_model = modelId;
    $('#api_button_textgenerationwebui').trigger('click');

    const limits = mancerModels.find(x => x.id === modelId)?.limits;
    setGenerationParamsFromPreset({ max_length: limits.context, genamt: limits.completion });
}

function onTogetherModelSelect() {
    const modelName = String($('#model_togetherai_select').val());
    textgen_settings.togetherai_model = modelName;
    $('#api_button_textgenerationwebui').trigger('click');
    const model = togetherModels.find(x => x.name === modelName);
    setGenerationParamsFromPreset({ max_length: model.context_length });
}

function onInfermaticAIModelSelect() {
    const modelName = String($('#model_infermaticai_select').val());
    textgen_settings.infermaticai_model = modelName;
    $('#api_button_textgenerationwebui').trigger('click');
    const model = infermaticAIModels.find(x => x.id === modelName);
    setGenerationParamsFromPreset({ max_length: model.context_length });
}

function onOllamaModelSelect() {
    const modelId = String($('#ollama_model').val());
    textgen_settings.ollama_model = modelId;
    $('#api_button_textgenerationwebui').trigger('click');
}

function onOpenRouterModelSelect() {
    const modelId = String($('#openrouter_model').val());
    textgen_settings.openrouter_model = modelId;
    $('#api_button_textgenerationwebui').trigger('click');
    const model = openRouterModels.find(x => x.id === modelId);
    setGenerationParamsFromPreset({ max_length: model.context_length });
}

function getMancerModelTemplate(option) {
    const model = mancerModels.find(x => x.id === option?.element?.value);

    if (!option.id || !model) {
        return option.text;
    }

    const creditsPerPrompt = (model.limits?.context - model.limits?.completion) * model.pricing?.prompt;
    const creditsPerCompletion = model.limits?.completion * model.pricing?.completion;
    const creditsTotal = Math.round(creditsPerPrompt + creditsPerCompletion).toFixed(0);

    return $((`
        <div class="flex-container flexFlowColumn">
            <div><strong>${DOMPurify.sanitize(model.name)}</strong> | <span>${model.limits?.context} ctx</span> / <span>${model.limits?.completion} res</span> | <small>Credits per request (max): ${creditsTotal}</small></div>
        </div>
    `));
}

function getTogetherModelTemplate(option) {
    const model = togetherModels.find(x => x.name === option?.element?.value);

    if (!option.id || !model) {
        return option.text;
    }

    return $((`
        <div class="flex-container flexFlowColumn">
            <div><strong>${DOMPurify.sanitize(model.name)}</strong> | <span>${model.context_length || '???'} tokens</span></div>
            <div><small>${DOMPurify.sanitize(model.description)}</small></div>
        </div>
    `));
}

function getInfermaticAIModelTemplate(option) {
    const model = infermaticAIModels.find(x => x.id === option?.element?.value);

    if (!option.id || !model) {
        return option.text;
    }

    return $((`
        <div class="flex-container flexFlowColumn">
            <div><strong>${DOMPurify.sanitize(model.id)}</strong></div>
        </div>
    `));
}

function getOpenRouterModelTemplate(option) {
    const model = openRouterModels.find(x => x.id === option?.element?.value);

    if (!option.id || !model) {
        return option.text;
    }

    let tokens_dollar = Number(1 / (1000 * model.pricing?.prompt));
    let tokens_rounded = (Math.round(tokens_dollar * 1000) / 1000).toFixed(0);

    const price = 0 === Number(model.pricing?.prompt) ? 'Free' : `${tokens_rounded}k t/$ `;

    return $((`
        <div class="flex-container flexFlowColumn" title="${DOMPurify.sanitize(model.id)}">
            <div><strong>${DOMPurify.sanitize(model.name)}</strong> | ${model.context_length} ctx | <small>${price}</small></div>
        </div>
    `));
}

async function downloadOllamaModel() {
    try {
        const serverUrl = textgen_settings.server_urls[textgen_types.OLLAMA];

        if (!serverUrl) {
            toastr.info('Please connect to an Ollama server first.');
            return;
        }

        const html = `Enter a model tag, for example <code>llama2:latest</code>.<br>
        See <a target="_blank" href="https://ollama.ai/library">Library</a> for available models.`;
        const name = await callPopup(html, 'input', '', { okButton: 'Download' });

        if (!name) {
            return;
        }

        toastr.info('Download may take a while, please wait...', 'Working on it');

        const response = await fetch('/api/backends/text-completions/ollama/download', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                name: name,
                api_server: serverUrl,
            }),
        });

        if (!response.ok) {
            throw new Error(response.statusText);
        }

        // Force refresh the model list
        toastr.success('Download complete. Please select the model from the dropdown.');
        $('#api_button_textgenerationwebui').trigger('click');
    } catch (err) {
        console.error(err);
        toastr.error('Failed to download Ollama model. Please try again.');
    }
}

export function getCurrentOpenRouterModelTokenizer() {
    const modelId = textgen_settings.openrouter_model;
    const model = openRouterModels.find(x => x.id === modelId);
    switch (model?.architecture?.tokenizer) {
        case 'Llama2':
            return tokenizers.LLAMA;
        case 'Mistral':
            return tokenizers.MISTRAL;
        default:
            return tokenizers.OPENAI;
    }
}

jQuery(function () {
    $('#mancer_model').on('change', onMancerModelSelect);
    $('#model_togetherai_select').on('change', onTogetherModelSelect);
    $('#model_infermaticai_select').on('change', onInfermaticAIModelSelect);
    $('#ollama_model').on('change', onOllamaModelSelect);
    $('#openrouter_model').on('change', onOpenRouterModelSelect);
    $('#ollama_download_model').on('click', downloadOllamaModel);

    if (!isMobile()) {
        $('#mancer_model').select2({
            placeholder: 'Select a model',
            searchInputPlaceholder: 'Search models...',
            searchInputCssClass: 'text_pole',
            width: '100%',
            templateResult: getMancerModelTemplate,
        });
        $('#model_togetherai_select').select2({
            placeholder: 'Select a model',
            searchInputPlaceholder: 'Search models...',
            searchInputCssClass: 'text_pole',
            width: '100%',
            templateResult: getTogetherModelTemplate,
        });
        $('#ollama_model').select2({
            placeholder: 'Select a model',
            searchInputPlaceholder: 'Search models...',
            searchInputCssClass: 'text_pole',
            width: '100%',
        });
        $('#model_infermaticai_select').select2({
            placeholder: 'Select a model',
            searchInputPlaceholder: 'Search models...',
            searchInputCssClass: 'text_pole',
            width: '100%',
            templateResult: getInfermaticAIModelTemplate,
        });
        $('#openrouter_model').select2({
            placeholder: 'Select a model',
            searchInputPlaceholder: 'Search models...',
            searchInputCssClass: 'text_pole',
            width: '100%',
            templateResult: getOpenRouterModelTemplate,
        });
    }
});
