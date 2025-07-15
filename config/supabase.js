const SUPABASE_URL = 'https://hcwqlbjnweatwmvkcape.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd3FsYmpud2VhdHdtdmtjYXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjM1ODMsImV4cCI6MjA2ODA5OTU4M30.oItoCmICG44IJ_Iai2wE1GEgK3pQW-PJbuk8TCuf3O0';

class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.headers = {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
    }

    async query(table, method = 'GET', data = null, filters = '') {
        const url = `${this.url}/rest/v1/${table}${filters}`;
        const options = {
            method,
            headers: this.headers
        };

        if (data && (method === 'POST' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            return method === 'DELETE' ? null : await response.json();
        } catch (error) {
            console.error('Database error:', error);
            throw new Error(`Database operation failed: ${error.message}`);
        }
    }

    async select(table, filters = '') {
        return await this.query(table, 'GET', null, filters);
    }

    async insert(table, data) {
        return await this.query(table, 'POST', data);
    }

    async update(table, data, filters) {
        return await this.query(table, 'PATCH', data, filters);
    }

    async delete(table, filters) {
        return await this.query(table, 'DELETE', null, filters);
    }

    async rpc(functionName, params = {}) {
        const url = `${this.url}/rest/v1/rpc/${functionName}`;
        const options = {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(params)
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Function call failed: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Function error:', error);
            throw error;
        }
    }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase;
