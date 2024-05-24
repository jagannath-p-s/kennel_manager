import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://umolelytazoocoyoovhq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtb2xlbHl0YXpvb2NveW9vdmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU4NjIyMjEsImV4cCI6MjAzMTQzODIyMX0.me8p1j2PlTZqD0tPkJLFgDEZMTszN45xiEUaJ3cZJ0g";

export const supabase =  createClient(supabaseUrl, supabaseKey);
