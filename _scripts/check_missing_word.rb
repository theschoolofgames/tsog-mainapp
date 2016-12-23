#!/usr/bin/ruby

dict_path = "../frameworks/runtime-src/proj.android-studio/pocketsphinx/sync/sw.dict"

words_path = "swahili.text"

dict_words = []

text = File.open(dict_path).read
text.gsub!(/\r\n?/, "\n")
text.each_line do |line|
    dict_words << line.gsub(/(\w+).*/, '\1').gsub(/\s+/, "").downcase
end

text = File.open(words_path).read
text.gsub!(/\r\n?/, "\n")
text.each_line do |line|
    words = line.split(" ")
    words.each do |w|
        w = w.downcase
        puts w unless dict_words.include?(w)
    end
end